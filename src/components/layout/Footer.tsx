"use client";

import { Facebook, Github, Instagram, Linkedin, Youtube } from "lucide-react";
import { fraunces, inter } from "@/components/editorial/fonts";

const socialLinks = [
  { href: "https://github.com/faqihfnf", label: "GitHub", Icon: Github },
  { href: "https://www.linkedin.com/in/faqih-nur-fahmi-b51bb1ab/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.facebook.com/faqihnurfahmi", label: "Facebook", Icon: Facebook },
  { href: "https://www.youtube.com/@marifahid", label: "YouTube", Icon: Youtube },
  { href: "https://www.instagram.com/faqih.me", label: "Instagram", Icon: Instagram },
];

export default function Footer() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial`}>
      <footer className="border-t border-[var(--ed-border)] bg-[var(--ed-bg-elevated)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-8 md:gap-6 md:px-10 md:py-10">
          <p className="ed-serif italic shrink-0 tracking-tight md:text-lg ed-accent-em font-semibold">Faqih Nur Fahmi</p>

          {/* Mobile: ikon; desktop: label teks */}
          <div className="flex items-center gap-3 md:gap-6">
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="ed-link md:text-[11px] md:uppercase md:tracking-[0.18em]">
                <Icon size={18} strokeWidth={1.5} className="md:hidden" />
                <span className="hidden md:inline">{label}</span>
              </a>
            ))}
          </div>

          <p className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--ed-text-muted)] md:text-[11px] md:tracking-[0.18em]">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
