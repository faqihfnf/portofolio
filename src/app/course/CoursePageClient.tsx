"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { fraunces, inter } from "@/components/editorial/fonts";

export default function CoursePageClient() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <div className="mx-auto w-full max-w-[920px] px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <div className="flex flex-col items-center py-16 text-center md:py-24">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ed-text-muted)]">Course</p>

          <h1 className="animate-enter ed-serif mt-4 text-3xl leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.2]">Segera Hadir</h1>

          <p className="animate-enter mt-4 max-w-md leading-relaxed text-[var(--ed-text-secondary)]" style={{ animationDelay: "150ms" }}>
            Kami sedang menyiapkan halaman ini. Nantikan pembaruan menarik yang sedang dalam pengerjaan!
          </p>

          <div className="animate-enter mt-8 w-48" style={{ animationDelay: "300ms" }}>
            <div className="h-px w-full overflow-hidden bg-[var(--ed-border)]">
              <motion.div
                className="h-px bg-[var(--ed-accent)]"
                initial={{ width: "15%" }}
                animate={{ width: ["15%", "70%", "45%", "85%"] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">In development</p>
          </div>

          <div className="animate-enter mt-10" style={{ animationDelay: "450ms" }}>
            <EditorialButton asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </EditorialButton>
          </div>
        </div>
      </div>
    </div>
  );
}
