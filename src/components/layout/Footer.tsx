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
        {/* Mobile: ditumpuk & rata tengah supaya tidak padat; desktop: satu baris */}
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 px-6 py-10 text-center md:flex-row md:justify-between md:gap-6 md:px-10 md:py-10 md:text-left">
          <p className="ed-serif italic shrink-0 text-lg tracking-tight ed-accent-em font-semibold">Faqih Nur Fahmi</p>

          {/* Mobile: ikon; desktop: label teks */}
          <div className="flex items-center gap-2 md:gap-6">
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="ed-link p-2 md:p-0 md:text-[11px] md:uppercase md:tracking-[0.18em]">
                <Icon size={20} strokeWidth={1.5} className="md:hidden" />
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
