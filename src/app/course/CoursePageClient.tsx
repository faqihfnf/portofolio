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

          <motion.h1
            className="ed-serif mt-4 text-3xl leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.2]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Segera Hadir
          </motion.h1>

          <motion.p
            className="mt-4 max-w-md leading-relaxed text-[var(--ed-text-secondary)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Kami sedang menyiapkan halaman ini. Nantikan pembaruan menarik yang sedang dalam pengerjaan!
          </motion.p>

          <motion.div
            className="mt-8 w-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-px w-full overflow-hidden bg-[var(--ed-border)]">
              <motion.div
                className="h-px bg-[var(--ed-accent)]"
                initial={{ width: "15%" }}
                animate={{ width: ["15%", "70%", "45%", "85%"] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">In development</p>
          </motion.div>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <EditorialButton asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </EditorialButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
