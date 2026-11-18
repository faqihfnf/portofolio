"use client";
import { motion } from "motion/react";

export function ContactInfo() {
  const items = [
    { label: "Email", value: "faqih.fnf@gmail.com", href: "mailto:faqih.fnf@gmail.com" },
    { label: "Phone", value: "+62 899 6423 135", href: "tel:+628996423135" },
    { label: "Location", value: "Jakarta, Indonesia" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-[var(--ed-text-muted)]">Contact Info</h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.label} className="border-b border-[var(--ed-border)] pb-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ed-text-muted)]">{item.label}</p>
            {item.href ? (
              <a href={item.href} className="ed-link mt-1 inline-block text-sm">
                {item.value}
              </a>
            ) : (
              <p className="mt-1 text-sm">{item.value}</p>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
