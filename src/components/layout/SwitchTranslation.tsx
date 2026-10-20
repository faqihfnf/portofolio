"use client";

import useLang from "@/hooks/useLang";

export default function SwitchTranslation() {
  const { changeLanguage, lang } = useLang();

  return (
    <button
      onClick={() => changeLanguage(lang === "id" ? "en" : "id")}
      aria-label={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className="cursor-pointer px-1 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-secondary)] transition-colors hover:text-[var(--ed-accent)]"
    >
      {lang === "id" ? "ID" : "EN"}
    </button>
  );
}
