"use client";

import Link from "next/link";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import { fraunces, inter } from "@/components/editorial/fonts";

export default function NotFound() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <div className="mx-auto flex min-h-screen w-full max-w-[920px] items-center justify-center px-6 py-20 md:px-10">
        <div className="text-center">
          {/* 404 — angka serif italic besar */}
          {/* Pembungkus yang dianimasikan, supaya opacity-30 pada angka tetap berlaku setelah animasi selesai */}
          <div className="animate-enter">
            <h1 className="ed-serif select-none text-[110px] italic leading-none text-[var(--ed-accent)] opacity-30 sm:text-[150px]">404</h1>
          </div>

          <div className="animate-enter" style={{ animationDelay: "150ms" }}>
            <h2 className="ed-serif mt-2 text-2xl tracking-tight sm:text-3xl">Halaman tidak ditemukan</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--ed-text-secondary)]">
              Halaman yang Anda cari tidak ada atau sudah dipindahkan.
            </p>
          </div>

          <div className="animate-enter mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "300ms" }}>
            <EditorialButton asChild variant="primary">
              <Link href="/">Back to Home</Link>
            </EditorialButton>
            <EditorialButton variant="secondary" onClick={() => history.back()}>
              Go Back
            </EditorialButton>
          </div>
        </div>
      </div>
    </div>
  );
}
