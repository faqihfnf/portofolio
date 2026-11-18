"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { useTheme } from "next-themes";

// ============================================================
// Cloudflare Turnstile — render eksplisit, tanpa library tambahan
// Script baru dimuat saat form mulai disentuh, dan widget hanya terlihat
// kalau Cloudflare memang membutuhkan interaksi pengunjung.
// ============================================================

interface TurnstileOptions {
  sitekey: string;
  appearance?: "always" | "execute" | "interaction-only";
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  language?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: (code: string) => boolean | void;
  "before-interactive-callback"?: () => void;
  "after-interactive-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;

// https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/
function isRetryableError(code: string): boolean {
  return /^(300|600)/.test(code) || ["110600", "110620", "200500"].includes(code);
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile tidak tersedia")));
      script.onerror = () => {
        // Biarkan percobaan berikutnya memuat ulang script
        scriptPromise = null;
        script.remove();
        reject(new Error("Gagal memuat Turnstile"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Muat widget lebih awal supaya token sudah siap saat form dikirim */
  prepare: () => void;
  /** Token untuk satu kali kirim. Menunggu sampai tantangan selesai. */
  getToken: () => Promise<string>;
  /** Token hanya sekali pakai — minta token baru setelah setiap percobaan kirim */
  reset: () => void;
}

interface Waiter {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

export default function Turnstile({ ref }: { ref: Ref<TurnstileHandle> }) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const waitersRef = useRef<Waiter[]>([]);
  const renderPromiseRef = useRef<Promise<void> | null>(null);
  const errorCountRef = useRef(0);
  // Beri jarak hanya saat widget benar-benar tampil
  const [interactive, setInteractive] = useState(false);

  const ensureWidget = useCallback(() => {
    if (!SITE_KEY) return Promise.reject(new Error("NEXT_PUBLIC_TURNSTILE_SITE_KEY belum diisi"));

    if (!renderPromiseRef.current) {
      renderPromiseRef.current = loadTurnstile()
        .then((turnstile) => {
          if (!containerRef.current || widgetIdRef.current) return;
          widgetIdRef.current = turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            appearance: "interaction-only",
            size: "flexible",
            language: "id",
            theme: resolvedTheme === "dark" ? "dark" : "light",
            callback: (token) => {
              tokenRef.current = token;
              errorCountRef.current = 0;
              waitersRef.current.splice(0).forEach((waiter) => waiter.resolve(token));
            },
            "expired-callback": () => {
              tokenRef.current = null;
            },
            "error-callback": (code) => {
              tokenRef.current = null;
              errorCountRef.current += 1;
              // Kode 300*/600*/110600/110620/200500 bisa pulih: Turnstile mencoba ulang sendiri (retry "auto"),
              // jadi form jangan langsung digagalkan. Kode konfigurasi (sitekey/hostname salah) tidak akan pulih.
              const retryable = isRetryableError(code) && errorCountRef.current <= MAX_RETRIES;
              if (retryable) return true;

              const hint = String(code).startsWith("1102") ? " — hostname ini belum terdaftar di widget Turnstile Cloudflare" : "";
              waitersRef.current.splice(0).forEach((waiter) => waiter.reject(new Error(`Turnstile error ${code}${hint}`)));
              return true;
            },
            "before-interactive-callback": () => setInteractive(true),
            "after-interactive-callback": () => setInteractive(false),
          });
        })
        .catch((error) => {
          renderPromiseRef.current = null;
          throw error;
        });
    }
    return renderPromiseRef.current;
  }, [resolvedTheme]);

  useImperativeHandle(
    ref,
    () => ({
      prepare: () => {
        ensureWidget().catch(() => {});
      },
      getToken: async () => {
        await ensureWidget();
        if (tokenRef.current) return tokenRef.current;

        return new Promise<string>((resolve, reject) => {
          const waiter: Waiter = {
            resolve: (token) => {
              clearTimeout(timer);
              resolve(token);
            },
            reject: (error) => {
              clearTimeout(timer);
              reject(error);
            },
          };
          const timer = setTimeout(() => {
            waitersRef.current = waitersRef.current.filter((item) => item !== waiter);
            reject(new Error("Turnstile timeout"));
          }, TOKEN_TIMEOUT_MS);
          waitersRef.current.push(waiter);
        });
      },
      reset: () => {
        tokenRef.current = null;
        errorCountRef.current = 0;
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
      },
    }),
    [ensureWidget],
  );

  useEffect(() => {
    return () => {
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      // Supaya widget dirender ulang kalau komponen dipasang lagi (mis. Strict Mode di dev)
      renderPromiseRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={interactive ? "mb-5" : ""} />;
}
