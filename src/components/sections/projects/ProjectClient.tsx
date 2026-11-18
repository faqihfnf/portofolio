"use client";

import CardProject from "@/components/sections/projects/CardProject";
import { Project } from "@/services/notionServices";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import SectionHeader from "@/components/editorial/SectionHeader";
import { fraunces, inter } from "@/components/editorial/fonts";
import { EditorialButton } from "@/components/editorial/EditorialButton";

const INITIAL_COUNT = 5;

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const handleLoadMore = () => setVisibleCount((prev) => prev + INITIAL_COUNT);

  const { t } = useTranslation();

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <AnimateOnScroll immediate>
          <SectionHeader tag={t("projects.tag")} title={t("projects.title")} description={t("projects.description")} />
        </AnimateOnScroll>

        {/* Daftar proyek — baris tipis konsisten dengan NumberedList */}
        <ol className="border-t border-[var(--ed-border)]">
          {projects.slice(0, visibleCount).map((project, index) => (
            <CardProject key={project.id} project={project} index={index} />
          ))}
        </ol>

        {/* Load More */}
        {visibleCount < projects.length && (
          <div className="mt-10 text-center">
            <EditorialButton type="button" onClick={handleLoadMore} variant="primary">
              Load More
            </EditorialButton>
          </div>
        )}
      </section>
    </div>
  );
}
