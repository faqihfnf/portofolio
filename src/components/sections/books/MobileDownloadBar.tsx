"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, X } from "lucide-react";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import DownloadForm from "./DownloadForm";

interface MobileDownloadBarProps {
  slug: string;
  title: string;
  /** id elemen form unduh di bagian bawah halaman — begitu terlihat, tombol sticky disembunyikan */
  hideAtId: string;
}

/** Mobile saja: tombol "Unduh Gratis" yang menempel di bawah layar + form sebagai bottom sheet */
export default function MobileDownloadBar({ slug, title, hideAtId }: MobileDownloadBarProps) {
  const [open, setOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(true);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Form di bagian bawah halaman sudah terlihat (atau terlewati) → tombol sticky tidak diperlukan lagi
  useEffect(() => {
    const target = document.getElementById(hideAtId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top > 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hideAtId]);

  // Saat sheet terbuka: kunci scroll halaman, Esc untuk menutup
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {barVisible && !open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ed-border)] bg-[var(--ed-bg)] px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          >
            <EditorialButton type="button" variant="solid" onClick={() => setOpen(true)} aria-haspopup="dialog" className="w-full">
              <Download size={14} strokeWidth={1.5} aria-hidden="true" />
              Unduh Gratis
            </EditorialButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[100] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="download-sheet-title"
              tabIndex={-1}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-[101] max-h-[90dvh] overflow-y-auto rounded-t-xl border-t border-[var(--ed-border)] bg-[var(--ed-bg)] px-6 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))] outline-none"
            >
              <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-[var(--ed-border)]" />

              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">Unduh Gratis</p>
                  <h2 id="download-sheet-title" className="ed-serif mt-1.5 text-xl leading-snug tracking-tight">
                    {title}
                  </h2>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="-mr-2 flex-shrink-0 cursor-pointer p-2 text-[var(--ed-text-secondary)] transition-colors hover:text-[var(--ed-accent)]">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <DownloadForm slug={slug} className="mt-7" onDone={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
