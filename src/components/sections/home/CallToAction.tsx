"use client";

import { EditorialButton } from "@/components/editorial/EditorialButton";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export default function CallToAction() {
  const { t } = useTranslation();

  // Jenis kerja sama yang sedang dibuka — HR untuk full-time, development untuk freelance/proyek.
  // Teksnya di translation cta.items
  const offerings = [1, 2, 3].map((id) => ({
    tag: t(`cta.items.${id}.tag`),
    title: t(`cta.items.${id}.title`),
    desc: t(`cta.items.${id}.desc`),
  }));

  return (
    <section>
      <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center md:px-10 md:py-28 ">
        <h2 className="ed-serif mx-auto max-w-3xl text-4xl leading-[1.08] tracking-tight md:text-6xl">
          {t("cta.title")} <em className="ed-accent-em">{t("cta.title-emphasis")}</em>
          {t("cta.title-ending")}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[var(--ed-text-secondary)]">{t("cta.description")}</p>

        {/* Daftar kerja sama — baris tipis, 3 kolom di desktop */}
        <AnimateOnScroll animation="fade-up">
          <ul className="mt-12 grid grid-cols-1 border-t border-[var(--ed-border)] md:grid-cols-3">
            {offerings.map((item, i) => (
              <li key={i} className="border-b border-[var(--ed-border)] px-2 py-7 md:border-b-0 md:border-l md:px-6 md:py-8 md:first:border-l-0">
                <span className="ed-serif block text-xl italic text-[var(--ed-text-muted)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-3 block text-[11px] uppercase tracking-[0.18em] text-[var(--ed-accent)]">{item.tag}</span>
                <h3 className="ed-serif mt-1.5 text-lg tracking-tight md:text-xl">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ed-text-secondary)]">{item.desc}</p>
              </li>
            ))}
          </ul>
        </AnimateOnScroll>

        <div className="mt-12">
          <EditorialButton asChild variant="primary">
            <Link href="/contact">{t("cta.button")}</Link>
          </EditorialButton>
        </div>
      </div>
    </section>
  );
}
