"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { certificates, type CertificateItem } from "@/data/certificates";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { fraunces, inter } from "@/components/editorial/fonts";
import { EditorialButton } from "@/components/editorial/EditorialButton";

// react-pdf butuh API browser, jadi skip SSR
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

const INITIAL_COUNT = 5;

export default function CertificatesClient() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const handleLoadMore = () => setVisibleCount((prev) => prev + INITIAL_COUNT);
  const handleCloseModal = () => setSelectedCert(null);

  const { t } = useTranslation();

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <SectionHeader tag="Certificates" title={t("certificates.title")} description={t("certificates.description")} />

        {/* Daftar bernomor — baris tipis, bukan grid kartu */}
        <ol className="border-t border-[var(--ed-border)]">
          {certificates.slice(0, visibleCount).map((cert, index) => (
            <motion.li
              key={cert.id}
              className="grid grid-cols-[48px_1fr] gap-4 border-b border-[var(--ed-border)] py-7 md:grid-cols-[80px_1fr_auto] md:gap-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (index % 8) * 0.08 }}
            >
              <button
                onClick={() => setSelectedCert(cert)}
                className="ed-serif cursor-pointer self-start text-2xl italic text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]"
                aria-label={`${t("certificates.view")} ${cert.title}`}
              >
                {String(index + 1).padStart(2, "0")}
              </button>

              <button onClick={() => setSelectedCert(cert)} className="cursor-pointer text-left">
                <h3 className="ed-serif text-lg tracking-tight md:text-xl">{cert.title}</h3>
                <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-[var(--ed-text-muted)]">{cert.organization}</p>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCert(cert);
                  }}
                  className="ed-link mt-3 inline-block text-[11px] uppercase tracking-[0.18em] text-[var(--ed-accent)]"
                >
                  {t("certificates.view")}
                </span>
              </button>

              <span className="col-start-2 self-start text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)] md:col-start-3 md:self-center">{cert.date}</span>
            </motion.li>
          ))}
        </ol>

        {/* Load More — teks underline bronze */}
        {visibleCount < certificates.length && (
          <div className="mt-10 text-center">
            <EditorialButton type="button" onClick={handleLoadMore} variant="primary">
              Load More
            </EditorialButton>
          </div>
        )}
      </section>

      {/* Modal Preview */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
            <motion.div
              className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border border-[var(--ed-border)] bg-[var(--ed-bg)] p-4 pt-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseModal} className="absolute top-3 right-4 text-lg text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]" aria-label="Close">
                &times;
              </button>

              {selectedCert.link.toLowerCase().endsWith(".pdf") ? (
                <>
                  <PdfViewer file={selectedCert.link} />
                  <div className="mt-4 text-center">
                    <a href={selectedCert.link} target="_blank" rel="noopener noreferrer" className="ed-link text-[11px] uppercase tracking-[0.18em] text-[var(--ed-accent)]">
                      {t("certificates.open-pdf")}
                    </a>
                  </div>
                </>
              ) : (
                <img src={selectedCert.link} alt={selectedCert.title} className="h-auto w-full rounded-md" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
