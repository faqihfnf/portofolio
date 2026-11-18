"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const PRODUCT_URL = "https://wawancarai.com";
const STACK = ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Supabase", "Tailwind CSS"];

export default function FeaturedProduct() {
  const { t } = useTranslation();

  const features = [1, 2, 3].map((id) => ({
    title: t(`featured.items.${id}.title`),
    desc: t(`featured.items.${id}.desc`),
  }));

  return (
    <section id="wawancarai" className="border-b border-[var(--ed-border)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-24">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            tag={t("featured.tag")}
            title={
              <>
                {t("featured.title")} <em className="ed-accent-em">{t("featured.title-emphasis")}</em>
              </>
            }
            description={t("featured.description")}
          />
        </AnimateOnScroll>

        {/* Pratinjau produk — gambar OG resmi Wawancarai */}
        <AnimateOnScroll animation="fade-up" delay={100}>
          <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("featured.button")}
            className="group block overflow-hidden rounded-lg border border-[var(--ed-border)] transition-colors hover:border-[var(--ed-accent)]"
          >
            <Image
              src="/projects/wawancarai-landing.png"
              alt={t("featured.image-alt")}
              width={937}
              height={577}
              sizes="(min-width: 1024px) 944px, 100vw"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </a>
        </AnimateOnScroll>

        {/* Cerita + metadata */}
        <AnimateOnScroll animation="fade-up" delay={150}>
          <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 md:grid-cols-[180px_1fr] md:gap-12">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">Wawancarai</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ed-accent)] opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ed-accent)]" />
                  </span>
                  {t("featured.status")}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">{t("featured.role-label")}</p>
                <p className="mt-2 text-sm" data-no-justify>
                  {t("featured.role")}
                </p>
              </div>
            </div>

            <div>
              <p className="leading-relaxed text-[var(--ed-text-secondary)]">{t("featured.story")}</p>

              <div className="mt-10 border-t border-[var(--ed-border)]">
                {features.map((item, i) => (
                  <div key={i} className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-[var(--ed-border)] py-5 md:grid-cols-[2.5rem_220px_1fr] md:gap-x-6">
                    <span className="ed-serif text-sm text-[var(--ed-accent)]">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="col-start-2 mt-1 text-sm leading-relaxed text-[var(--ed-text-secondary)] md:col-start-3 md:mt-0">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">{t("featured.stack-label")}</p>
                <p className="mt-2 text-sm text-[var(--ed-text-secondary)]" data-no-justify>
                  {STACK.join(" · ")}
                </p>
              </div>

              <div className="mt-10 flex justify-center md:justify-start">
                <EditorialButton asChild variant="primary">
                  <a href={PRODUCT_URL} target="_blank" rel="noopener noreferrer">
                    {t("featured.button")}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </EditorialButton>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
