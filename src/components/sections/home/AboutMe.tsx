"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import PullQuote from "@/components/editorial/PullQuote";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export default function AboutMe() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-[var(--ed-border)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-24">
        <SectionHeader
          tag={t("about.tag")}
          title={
            <>
              {t("about.title")} <em className="ed-accent-em">{t("about.title-emphasis")}</em>
            </>
          }
          description={t("about.description")}
        />

        {/* Photo + body text — tinggi sejajar dengan teks */}
        <AnimateOnScroll animation="fade-up">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[230px_1fr] md:gap-14">
            <div className="flex flex-col">
              <div className="relative mx-auto aspect-[1302/1208] w-full max-w-[400px] flex-1 overflow-hidden rounded-lg md:mx-0 md:aspect-auto md:max-w-none">
                <Image src="/profil.png" alt="Faqih Nur Fahmi, HR Manager and Full Stack Developer" fill sizes="(min-width: 768px) 230px, 400px" className="object-cover" />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="leading-relaxed text-[var(--ed-text-secondary)]">{t("about.content")}</p>
              <div className="mt-6 flex flex-1 items-end justify-center md:justify-start">
                <a href="https://faqih.id/blog/profil-faqih-nur-fahmi" target="_blank" rel="noopener noreferrer">
                  <EditorialButton variant="primary">{t("about.read-more")}</EditorialButton>
                </a>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Motto */}
        <AnimateOnScroll animation="fade-up" delay={150}>
          <div className="mt-16 max-w-5xl md:mt-20">
            <PullQuote cite={t("about.quote-cite")}>
              {t("about.quote-1")} <em className="ed-accent-em">{t("about.quote-people")}</em>, {t("about.quote-2")} <em className="ed-accent-em">{t("about.quote-process")}</em> {t("about.quote-3")}{" "}
              <em className="ed-accent-em">{t("about.quote-system")}</em>.
            </PullQuote>
          </div>
        </AnimateOnScroll>

        {/* Principles — thin-line list instead of cards */}
        <AnimateOnScroll animation="fade-up" delay={350}>
          <div className="mt-16 border-t border-[var(--ed-border)] md:mt-20">
            {[1, 2, 3].map((id) => (
              <div key={id} className="grid grid-cols-1 gap-1 border-b border-[var(--ed-border)] py-6 md:grid-cols-[220px_1fr] md:gap-10">
                <h3 className="text-sm font-medium">{t(`about.principles.${id}.title`)}</h3>
                <p className="text-sm leading-relaxed text-[var(--ed-text-secondary)]">{t(`about.principles.${id}.description`)}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
