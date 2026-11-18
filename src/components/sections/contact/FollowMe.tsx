"use client";
import { Github, Linkedin, Youtube, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export function FollowMe() {
  const socials = [
    { href: "https://github.com/faqihfnf", label: "GitHub" },
    { href: "https://www.linkedin.com/in/faqihnurfahmi/", label: "LinkedIn" },
    { href: "https://www.youtube.com/@marifahid", label: "YouTube" },
    { href: "https://www.instagram.com/faqih.me", label: "Instagram" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-[var(--ed-text-muted)]">Follow Me</h2>
      <div className="mt-5 flex flex-col gap-3">
        {socials.map((social) => (
          <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="ed-link flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
            {social.label}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
