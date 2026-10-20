"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  testimonial: string;
  linkedinUrl: string | null;
}

export default function Testimonials() {
  const { t } = useTranslation();
  const [data, setData] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % data.length);
  }, [data.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + data.length) % data.length);
  }, [data.length]);

  // Auto-rotate every 6 seconds — berhenti saat di-hover/fokus, dan mati jika OS minta reduce motion
  const autoRotate = data.length > 1 && !paused && !prefersReducedMotion;
  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, autoRotate]);

  // Don't render section if no testimonials
  if (!loading && data.length === 0) return null;

  return (
    <section className="border-b border-[var(--ed-border)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-24">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            tag="Testimonials"
            title={
              <>
                {t("testimonials.title")}
                <em className="ed-accent-em">{t("testimonials.title-1")}</em>
              </>
            }
            description={t("testimonials.description")}
          />
        </AnimateOnScroll>

        {loading ? (
          <div className="mx-auto max-w-2xl animate-pulse">
            <div className="h-40 rounded-lg border border-[var(--ed-border)]" />
          </div>
        ) : (
          <AnimateOnScroll animation="fade-up" delay={150}>
            <div
              className="relative mx-auto max-w-2xl"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
              }}
            >
              <div className="rounded-lg border border-[var(--ed-border)] bg-[var(--ed-bg-elevated)] px-7 py-9 md:px-10" aria-live={autoRotate ? "off" : "polite"}>
                <AnimatePresence mode="wait">
                  <motion.div key={current} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
                    <p className="min-h-[10rem] text-md italic leading-relaxed tracking-tight ">{data[current].testimonial}</p>

                    <div className="mt-7 border-t border-[var(--ed-border)] pt-5">
                      {data[current].linkedinUrl ? (
                        <a href={data[current].linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${data[current].name} (LinkedIn)`} className="group inline-flex items-center gap-1.5 text-sm font-medium">
                          <span className="ed-link">{data[current].name}</span>
                          <Linkedin className="h-3.5 w-3.5 text-[var(--ed-text-muted)] transition-colors group-hover:text-[var(--ed-accent)]" aria-hidden="true" />
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{data[current].name}</p>
                      )}
                      <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-[var(--ed-text-muted)]">
                        {data[current].position}
                        {data[current].company && <span> &middot; {data[current].company}</span>}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              {data.length > 1 && (
                <div className="mt-6 flex items-center justify-center gap-6">
                  <button onClick={prev} className="text-xs uppercase cursor-pointer tracking-[0.18em] text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]">
                    Prev
                  </button>
                  <div className="flex gap-2">
                    {data.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to testimonial ${i + 1}`}
                        aria-current={i === current}
                        className="h-1.5 w-1.5 rounded-full transition-all"
                        style={{ backgroundColor: i === current ? "var(--ed-accent)" : "var(--ed-border)" }}
                      />
                    ))}
                  </div>
                  <button onClick={next} className="text-xs uppercase cursor-pointer tracking-[0.18em] text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]">
                    Next
                  </button>
                </div>
              )}
            </div>
          </AnimateOnScroll>
        )}

        {/* Undangan menulis testimoni */}
        <AnimateOnScroll animation="fade-up" delay={250}>
          <div className="mx-auto mt-14 max-w-xl border-t border-[var(--ed-border)] pt-10 text-center">
            <p className="leading-relaxed text-[var(--ed-text-secondary)]">{t("testimonials.cta-text")}</p>
            <div className="mt-6">
              <EditorialButton asChild variant="primary">
                <Link href="/testimonials/create">{t("testimonials.cta-button")}</Link>
              </EditorialButton>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
