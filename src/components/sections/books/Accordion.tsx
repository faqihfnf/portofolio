"use client";

import { useId, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/**
 * Accordion editorial — dipisah garis tipis, tanpa card.
 * Isi tetap ada di DOM saat tertutup (tinggi 0 + inert) supaya tetap terbaca mesin pencari.
 */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="border-t border-[var(--ed-border)]">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className="border-b border-[var(--ed-border)]">
            <h3>
              <button id={buttonId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(item.id)} className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left">
                <span className="ed-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-[var(--ed-accent)]">{item.title}</span>
                <Plus size={16} strokeWidth={1.5} aria-hidden="true" className={`flex-shrink-0 text-[var(--ed-text-muted)] transition-transform duration-300 group-hover:text-[var(--ed-accent)] ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} inert={!isOpen} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="pb-6 leading-relaxed text-[var(--ed-text-secondary)]">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
