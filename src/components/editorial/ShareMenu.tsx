"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Facebook, Link2, Linkedin, MessageCircle, Share2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Tombol "Bagikan" + menu: WhatsApp, LinkedIn, Facebook, Salin Link.
// Dipakai di halaman detail blog dan buku.
// ============================================================

interface ShareMenuProps {
  /** URL absolut halaman yang dibagikan, mis. https://faqih.id/blog/slug */
  url: string;
  /** Teks pengantar untuk WhatsApp (LinkedIn & Facebook hanya menerima URL) */
  text: string;
  className?: string;
}

interface ShareTarget {
  label: string;
  icon: LucideIcon;
  href: string;
}

const COPIED_RESET_MS = 2000;

const itemClass =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[var(--ed-text-secondary)] transition-colors hover:bg-[var(--ed-bg-elevated)] hover:text-[var(--ed-text)] focus-visible:bg-[var(--ed-bg-elevated)] focus-visible:text-[var(--ed-text)] focus-visible:outline-none";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Fallback untuk browser/konteks tanpa Clipboard API (mis. http non-localhost)
    const input = document.createElement("textarea");
    input.value = value;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

export default function ShareMenu({ url, text, className }: ShareMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const encodedUrl = encodeURIComponent(url);
  const targets: ShareTarget[] = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  // Menu terbuka: fokus ke item pertama, tutup saat klik di luar atau Esc
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  // Panah atas/bawah berpindah antar item menu
  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const handleCopy = async () => {
    await copyText(url);
    setCopied(true);
  };

  return (
    <div ref={rootRef} data-no-justify className={cn("relative inline-block", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="ed-link inline-flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.18em] underline"
      >
        <Share2 size={14} strokeWidth={1.5} aria-hidden="true" />
        Bagikan
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Bagikan ke"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-30 mt-3 min-w-[200px] normal-case tracking-normal overflow-hidden rounded-[2px] border border-[var(--ed-border)] bg-[var(--ed-bg)] py-1.5 shadow-xl"
          >
            {targets.map(({ label, icon: Icon, href }) => (
              <li key={label} role="none">
                <a role="menuitem" href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={itemClass}>
                  <Icon size={16} strokeWidth={1.5} aria-hidden={true} />
                  {label}
                </a>
              </li>
            ))}
            <li role="none" className="mt-1.5 border-t border-[var(--ed-border)] pt-1.5">
              <button role="menuitem" type="button" onClick={handleCopy} className={itemClass}>
                {copied ? <Check size={16} strokeWidth={1.5} aria-hidden="true" className="text-[var(--ed-accent)]" /> : <Link2 size={16} strokeWidth={1.5} aria-hidden="true" />}
                <span aria-live="polite">{copied ? "Link disalin" : "Salin Link"}</span>
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
