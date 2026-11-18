"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { fraunces, inter } from "@/components/editorial/fonts";

// ============================================================
// Popup editorial — satu desain untuk semua popup di situs
// (form kontak, unduh ebook, testimoni). Dirender lewat portal ke body
// agar posisinya fixed terhadap viewport dan di atas bottom sheet / navbar.
// ============================================================

interface EditorialDialogProps {
  open: boolean;
  /** Dipanggil saat tombol X, Esc, atau klik di luar popup */
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  /** Tombol aksi di bagian bawah. Tombol pertama otomatis difokus saat popup terbuka. */
  actions?: ReactNode;
  /** Label aksesibel tombol X */
  closeLabel?: string;
}

// Portal hanya boleh dibuat di browser — false saat SSR, true setelah hidrasi
const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export default function EditorialDialog({ open, onClose, title, children, actions, closeLabel = "Tutup" }: EditorialDialogProps) {
  const isClient = useIsClient();
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  // Simpan onClose terbaru tanpa memicu ulang effect di bawah
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Saat terbuka: kunci scroll, fokus ke tombol aksi pertama, Esc menutup.
  // Saat tertutup: kembalikan scroll & fokus ke elemen sebelumnya.
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const card = cardRef.current;
      const firstAction = card?.querySelector<HTMLElement>("[data-dialog-actions] button, [data-dialog-actions] a");
      (firstAction ?? card)?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            // Token warna --ed-* hanya berlaku di dalam .editorial, jadi kartu membawa class-nya sendiri
            className={`${fraunces.variable} ${inter.variable} editorial relative w-full max-w-md rounded-lg border border-[var(--ed-border)] p-8 text-center shadow-2xl outline-none md:p-10`}
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={onClose} aria-label={closeLabel} className="absolute right-3 top-3 cursor-pointer p-2 text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]">
              <X size={18} strokeWidth={1.5} />
            </button>

            <div data-no-justify className="text-center">
              {/* Tanda kutip serif sebagai ornamen */}
              <span aria-hidden="true" className="ed-serif block text-5xl italic leading-none text-[var(--ed-accent)]">
                &ldquo;
              </span>
              <h2 id={titleId} className="ed-serif mt-3 text-2xl tracking-tight md:text-3xl">
                {title}
              </h2>
              {children && <div className="mt-4 leading-relaxed text-[var(--ed-text-secondary)]">{children}</div>}
              {actions && (
                <div data-dialog-actions className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
