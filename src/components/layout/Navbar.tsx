"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import SwitchTranslation from "@/components/layout/SwitchTranslation";
import { fraunces, inter } from "@/components/editorial/fonts";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  // Tema baru diketahui di client — sebelum mount, ikon dirender kosong agar tidak hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t("navbar.nav-item-1"), link: "/" },
    { name: t("navbar.nav-item-2"), link: "/experiences" },
    { name: t("navbar.nav-item-3"), link: "/projects" },
    { name: t("navbar.nav-item-4"), link: "/certificates" },
    { name: "Blog", link: "/blog" },
    { name: t("navbar.nav-item-6"), link: "https://courses.faqih.id/" },
    { name: t("navbar.nav-item-7"), link: "https://slides.faqih.id/" },
    { name: t("navbar.nav-item-5"), link: "/contact" },
  ];

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const themeIcon = (size: number) => (!mounted ? <span className="block" style={{ width: size, height: size }} /> : resolvedTheme === "dark" ? <Moon size={size} /> : <Sun size={size} />);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial`}>
      <header className={`fixed inset-x-0 top-0 z-50 border-b bg-[var(--ed-bg)] transition-colors duration-300 ${isScrolled ? "border-[var(--ed-border)]" : "border-transparent"}`}>
        <nav className="flex h-16 w-full items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Logo + Name */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={34} height={34} className="dark:invert" loading="eager" />
            <span className="ed-serif text-lg tracking-tight">FnF.</span>
          </Link>

          {/* Menu — sans, wide spacing */}
          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={`text-[11px] uppercase tracking-[0.18em] transition-colors ${pathname === item.link ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-secondary)] hover:text-[var(--ed-accent)]"}`}
              >
                {item.name}
              </Link>
            ))}
            <span className="h-4 w-px bg-[var(--ed-border)]" />
            <button onClick={toggleTheme} aria-label="Toggle theme" className="cursor-pointer text-[var(--ed-text-secondary)] transition-colors hover:text-[var(--ed-accent)]">
              {themeIcon(15)}
            </button>
            <SwitchTranslation />
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="cursor-pointer text-[var(--ed-text-secondary)] transition-colors hover:text-[var(--ed-accent)]">
              {themeIcon(17)}
            </button>
            <SwitchTranslation />
            <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu" className="cursor-pointer text-[var(--ed-text-secondary)] transition-colors hover:text-[var(--ed-accent)]">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} id="mobile-menu" className="border-t border-[var(--ed-border)] bg-[var(--ed-bg)] md:hidden">
              <div className="flex flex-col px-6 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.link}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`border-b border-[var(--ed-border)] py-3 text-[12px] uppercase tracking-[0.18em] transition-colors last:border-b-0 ${
                      pathname === item.link ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-secondary)] hover:text-[var(--ed-accent)]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
