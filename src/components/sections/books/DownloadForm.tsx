"use client";

import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import EditorialDialog from "@/components/editorial/EditorialDialog";
import { CONSENT_LABEL, PRIVACY_NOTE, SHARING_PERMISSION } from "@/data/books";
import { downloadFormSchema, type DownloadFormData, type DownloadRequest, type DownloadResponse } from "@/services/books/downloadSchema";
import Turnstile, { type TurnstileHandle } from "@/components/ui/Turnstile";

const GENERIC_ERROR = "Maaf, ebook belum berhasil dikirim. Silakan coba lagi beberapa saat lagi.";

const labelClass = "mb-1 block text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]";

const underlineInput =
  "w-full border-0 border-b border-[var(--ed-border)] bg-transparent px-0 py-2 text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)] focus:outline-none focus:border-[var(--ed-accent)] transition-colors rounded-none";

interface DownloadFormProps {
  slug: string;
  className?: string;
  /** Dipanggil setelah popup sukses ditutup (mis. untuk menutup bottom sheet di mobile) */
  onDone?: () => void;
}

export default function DownloadForm({ slug, className, onDone }: DownloadFormProps) {
  // Form ini bisa tampil lebih dari sekali dalam satu halaman, jadi id field harus unik
  const id = useId();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [sent, setSent] = useState<{ email: string; alreadySent: boolean } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DownloadFormData>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: { name: "", email: "", consent: false, hpCheck: "" },
  });

  const onSubmit = async (data: DownloadFormData) => {
    setSubmitError(null);

    let turnstileToken: string;
    try {
      if (!turnstileRef.current) throw new Error("Turnstile belum siap");
      turnstileToken = await turnstileRef.current.getToken();
    } catch (error) {
      console.error("Turnstile:", error);
      turnstileRef.current?.reset();
      setSubmitError("Verifikasi keamanan belum berhasil. Muat ulang halaman, lalu coba lagi.");
      return;
    }

    try {
      const payload: DownloadRequest = { ...data, slug, turnstileToken };
      const response = await fetch("/api/books/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: DownloadResponse = await response.json().catch(() => ({ ok: false }));

      if (!response.ok || !result.ok) {
        setSubmitError(result.error ?? GENERIC_ERROR);
        return;
      }
      setSent({ email: data.email.trim(), alreadySent: Boolean(result.alreadySent) });
      reset();
    } catch {
      setSubmitError("Koneksi terputus. Periksa jaringan internet Anda, lalu coba lagi.");
    } finally {
      // Token Turnstile hanya sekali pakai
      turnstileRef.current?.reset();
    }
  };

  const closeSuccess = () => {
    setSent(null);
    onDone?.();
  };

  return (
    <>
      <form data-no-justify noValidate onSubmit={(e) => handleSubmit(onSubmit)(e)} onFocus={() => turnstileRef.current?.prepare()} className={className}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className={labelClass}>
              Nama <span className="normal-case tracking-normal">(opsional)</span>
            </label>
            <input id={`${id}-name`} autoComplete="name" {...register("name")} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? `${id}-name-error` : undefined} className={underlineInput} placeholder="Nama Anda" />
            {errors.name && (
              <p id={`${id}-name-error`} role="alert" className="mt-1.5 text-xs text-[var(--ed-accent)]">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${id}-email`} className={labelClass}>
              Email
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              {...register("email")}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${id}-email-error` : undefined}
              className={underlineInput}
              placeholder="nama@email.com"
            />
            {errors.email && (
              <p id={`${id}-email-error`} role="alert" className="mt-1.5 text-xs text-[var(--ed-accent)]">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Honeypot — tidak terlihat dan tidak bisa difokus oleh manusia */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-hp`}>Biarkan kosong</label>
          {/* data-1p-ignore / data-lpignore: cegah password manager (1Password, LastPass) ikut mengisi */}
          <input id={`${id}-hp`} type="text" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" {...register("hpCheck")} />
        </div>

        <label htmlFor={`${id}-consent`} className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--ed-text-secondary)]">
          <input id={`${id}-consent`} type="checkbox" {...register("consent")} className="mt-1 size-4 flex-shrink-0 cursor-pointer accent-[var(--ed-accent)]" />
          <span>{CONSENT_LABEL}</span>
        </label>

        <div className="mt-6">
          <Turnstile ref={turnstileRef} />

          {submitError && (
            <p role="alert" className="mb-4 text-sm leading-relaxed text-[var(--ed-accent)]">
              {submitError}
            </p>
          )}

          <EditorialButton type="submit" variant="solid" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Mengirim…" : "Kirim ke Email Saya"}
          </EditorialButton>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-[var(--ed-text-muted)]">{PRIVACY_NOTE}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--ed-text-muted)]">{SHARING_PERMISSION}</p>
      </form>

      {/* Popup sukses — desain sama dengan popup form kontak & testimoni */}
      <EditorialDialog
        open={sent !== null}
        onClose={closeSuccess}
        title={sent?.alreadySent ? "Ebook sudah dikirim" : "Ebook sedang dalam perjalanan"}
        actions={
          <EditorialButton type="button" variant="secondary" onClick={closeSuccess}>
            Tutup
          </EditorialButton>
        }
      >
        {sent && (
          <p role="status">
            {sent.alreadySent ? "Ebook ini sudah dikirim ke " : "Ebook sedang dalam perjalanan ke "}
            <strong className="font-medium text-[var(--ed-text)]">{sent.email}</strong>
            {sent.alreadySent
              ? " beberapa menit yang lalu. Silakan periksa inbox Anda, termasuk folder Spam atau Promosi."
              : ". Jika belum masuk dalam beberapa menit, periksa folder Spam atau Promosi."}
          </p>
        )}
      </EditorialDialog>
    </>
  );
}
