"use client";

import { motion } from "motion/react";
import { Project } from "@/services/notionServices";
import { useTranslation } from "react-i18next";
import { enterOnLoad } from "@/components/ui/animate-on-scroll";

interface CardProjectProps {
  project: Project;
  index: number;
}

export default function CardProject({ project, index }: CardProjectProps) {
  const { title, description, technologies, slug, liveUrl, githubUrl } = project;
  const { t } = useTranslation();
  const enter = enterOnLoad(index, 3, 100);

  return (
    <motion.li
      className={`grid grid-cols-[48px_1fr] gap-4 border-b border-[var(--ed-border)] py-9 md:grid-cols-[80px_1fr] md:gap-10 md:py-11 ${enter?.className ?? ""}`}
      style={enter?.style}
      initial={enter ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.1 }}
    >
      {/* Nomor italic serif */}
      <span className="ed-serif self-start text-2xl italic text-[var(--ed-text-muted)]">{String(index + 1).padStart(2, "0")}</span>

      <div>
        {/* Judul serif + tautan */}
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <h3 className="ed-serif text-xl tracking-tight md:text-2xl">
            {liveUrl ? (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ed-accent)]">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>

          <div className="flex gap-6">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="ed-link text-[11px] uppercase tracking-[0.18em]">
                Live
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="ed-link text-[11px] uppercase tracking-[0.18em]">
                GitHub
              </a>
            )}
            {slug && (
              <a href={`/projects/${slug}`} className="ed-link text-[11px] uppercase tracking-[0.18em]">
                {t("projects.detail")}
              </a>
            )}
          </div>
        </div>

        {/* Deskripsi singkat */}
        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--ed-text-secondary)]">{description}</p>

        {/* Tag teknologi — teks kecil, bukan badge warna */}
        {technologies.length > 0 && (
          <p className="mt-4 text-[13px] text-[var(--ed-text-muted)]">
            {technologies.map((tech, i) => (
              <span key={tech}>
                {tech}
                {i < technologies.length - 1 && <span className="text-[var(--ed-border)]">{" · "}</span>}
              </span>
            ))}
          </p>
        )}
      </div>
    </motion.li>
  );
}
