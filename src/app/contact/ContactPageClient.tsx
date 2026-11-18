"use client";

import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactInfo } from "@/components/sections/contact/ContactInfo";
import { FollowMe } from "@/components/sections/contact/FollowMe";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { fraunces, inter } from "@/components/editorial/fonts";

export default function ContactPageClient() {
  const { t } = useTranslation();

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader tag={t("contact.tag")} title={t("contact.title")} description={t("contact.description")} />
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_300px] lg:gap-16">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <ContactForm />
          </AnimateOnScroll>

          <div className="flex flex-col gap-12">
            <AnimateOnScroll animation="fade-up" delay={200}>
              <ContactInfo />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={300}>
              <FollowMe />
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
