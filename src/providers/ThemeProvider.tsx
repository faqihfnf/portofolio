"use client";

import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";

interface ThemeProviderProps {
  children: ReactNode;
}

// next-themes menyuntikkan script kecil sebelum hydration, jadi class "dark"
// sudah terpasang di <html> sejak awal — tidak ada flash & SSR tetap utuh
export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {/* Hormati pengaturan "reduce motion" di OS pengunjung untuk semua animasi motion */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
