"use client";

import React from "react";

interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  technologies?: string[];
}

interface ExperienceTimelineProps {
  experiences: Experience[];
}

export default function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  return (
    <ol className="border-t border-[var(--ed-border)]">
      {experiences.map((exp, index) => (
        <li
          key={`${exp.title}-${exp.period}`}
          className="animate-enter grid grid-cols-1 gap-3 border-b border-[var(--ed-border)] py-9 md:grid-cols-[80px_1fr] md:gap-10 md:py-11"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          {/* Nomor italic serif */}
          <span className="ed-serif text-2xl italic text-[var(--ed-text-muted)]">{String(index + 1).padStart(2, "0")}</span>

          <div>
            {/* Baris 1: jabatan serif + periode */}
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h3 className="ed-serif text-xl tracking-tight md:text-2xl">{exp.title}</h3>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">{exp.period}</span>
            </div>

            {/* Baris 2: perusahaan · lokasi */}
            <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-[var(--ed-text-secondary)]">
              {exp.company}
              <span className="mx-2 text-[var(--ed-border)]">·</span>
              {exp.location}
            </p>

            {/* Deskripsi */}
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--ed-text-secondary)]">{exp.description}</p>

            {/* Teknologi — teks kecil, bukan badge warna */}
            {exp.technologies && exp.technologies.length > 0 && (
              <p className="mt-4 text-[13px] text-[var(--ed-text-muted)]">
                {exp.technologies.map((tech, i) => (
                  <span key={tech}>
                    {tech}
                    {i < exp.technologies!.length - 1 && <span className="text-[var(--ed-border)]">{" · "}</span>}
                  </span>
                ))}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
