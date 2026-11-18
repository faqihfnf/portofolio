"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BookImage } from "@/services/books/types";
import NotionImage from "@/components/ui/NotionImage";

/** Galeri pratinjau halaman — klik gambar untuk memperbesar (lightbox sederhana) */
export default function PreviewGallery({ images, title }: { images: BookImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isOpen = activeIndex !== null;
  const total = images.length;

  // Lightbox: kunci scroll halaman, Esc menutup, panah kiri/kanan berpindah gambar
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i === null ? i : (i + 1) % total));
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i === null ? i : (i - 1 + total) % total));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, total]);

  const step = (delta: number) => setActiveIndex((i) => (i === null ? i : (i + delta + total) % total));
  const navButton = "absolute top-1/2 -translate-y-1/2 cursor-pointer p-3 text-white/70 transition-colors hover:text-white";

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.url}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Perbesar pratinjau halaman ${index + 1}`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-[2px] border border-[var(--ed-border)] bg-[var(--ed-bg-elevated)] transition-colors hover:border-[var(--ed-accent)]"
            >
              <NotionImage src={image.url} alt={`Pratinjau halaman ${index + 1} — ${title}`} width={500} height={700} sizes="(min-width: 640px) 200px, 50vw" loading="lazy" className="aspect-[5/7] w-full object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>

      {isOpen && (
        <div role="dialog" aria-modal="true" aria-label={`Pratinjau halaman ${activeIndex + 1} dari ${total}`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10" onClick={() => setActiveIndex(null)}>
          <NotionImage src={images[activeIndex].url} alt={`Pratinjau halaman ${activeIndex + 1} — ${title}`} width={1200} height={1680} sizes="100vw" unoptimized className="h-auto max-h-full w-auto max-w-full rounded-[2px] object-contain" onClick={(e) => e.stopPropagation()} />

          <button type="button" autoFocus onClick={() => setActiveIndex(null)} aria-label="Tutup pratinjau" className="absolute right-3 top-3 cursor-pointer p-3 text-white/70 transition-colors hover:text-white">
            <X size={22} strokeWidth={1.5} />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Gambar sebelumnya"
                className={`${navButton} left-1`}
              >
                <ChevronLeft size={28} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Gambar berikutnya"
                className={`${navButton} right-1`}
              >
                <ChevronRight size={28} strokeWidth={1.5} />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.18em] text-white/70">
                {activeIndex + 1} / {total}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
