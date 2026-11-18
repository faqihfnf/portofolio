"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right";
  /**
   * Untuk konten di layar pertama (hero): animasi CSS murni yang langsung berjalan saat halaman
   * dilukis, tanpa menunggu JavaScript. Tanpa ini konten disembunyikan (opacity 0) sampai JS
   * selesai dimuat dan IntersectionObserver berjalan, sehingga halaman terasa lambat.
   */
  immediate?: boolean;
}

/**
 * Untuk item daftar (motion.li dengan whileInView): item di layar pertama memakai animasi CSS
 * `animate-enter` yang tidak menunggu JavaScript, item berikutnya tetap muncul saat di-scroll.
 * Mengembalikan null untuk item di luar layar pertama.
 */
export function enterOnLoad(index: number, firstScreen: number, stepMs: number) {
  if (index >= firstScreen) return null;
  return { className: "animate-enter", style: { animationDelay: `${index * stepMs}ms` } };
}

export function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
  immediate = false,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (immediate) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [delay, immediate]);

  if (immediate) {
    return (
      <div className={cn("animate-enter", className)} style={delay ? { animationDelay: `${delay}ms` } : undefined}>
        {children}
      </div>
    );
  }

  const animationClasses = {
    "fade-up": "animate-fade-up",
    "fade-in": "animate-fade-in",
    "slide-left": "animate-slide-left",
    "slide-right": "animate-slide-right",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "aos-init",
        animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
}
