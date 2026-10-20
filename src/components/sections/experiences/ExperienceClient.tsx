"use client";

import { useState } from "react";
import ExperienceTimeline from "@/components/sections/experiences/ExperienceTimeline";
import { getExperienceData } from "@/data/experiences";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { fraunces, inter } from "@/components/editorial/fonts";

export default function ExperienceClient() {
  const { t } = useTranslation();
  const { hrExperiences, techExperiences } = getExperienceData(t);
  const [activeTab, setActiveTab] = useState<"hr" | "tech">("hr");

  const currentExperiences = activeTab === "hr" ? hrExperiences : techExperiences;

  const tabs: { id: "hr" | "tech"; label: string }[] = [
    { id: "hr", label: "HR Journey" },
    { id: "tech", label: "Tech Journey" },
  ];

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            tag="Experience"
            title={
              <>
                {t("experience.title").replace(" Saya", "")} <em className="ed-accent-em">&amp; Journey</em>
              </>
            }
            description={t("experience.description")}
          />
        </AnimateOnScroll>

        {/* Tab — teks minimal dengan underline bronze */}
        <div className="flex gap-8 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px cursor-pointer border-b pb-3 text-[12px] uppercase tracking-[0.18em] transition-colors ${
                activeTab === tab.id ? "border-[var(--ed-accent)] text-[var(--ed-text)]" : "border-transparent text-[var(--ed-text-muted)] hover:text-[var(--ed-text-secondary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline — pola NumberedList, reset saat ganti tab */}
        <div key={activeTab}>
          <ExperienceTimeline experiences={currentExperiences} />
        </div>
      </section>
    </div>
  );
}
