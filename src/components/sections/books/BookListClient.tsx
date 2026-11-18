"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { fraunces, inter } from "@/components/editorial/fonts";
import { AnimateOnScroll, enterOnLoad } from "@/components/ui/animate-on-scroll";
import { categorySlug } from "@/lib/books";
import type { Book } from "@/services/books/types";
import BookCard from "./BookCard";

const CATEGORY_PARAM = "kategori";

export default function BookListClient({ books }: { books: Book[] }) {
  const { t } = useTranslation();
  // Filter disimpan di URL (?kategori=agama) supaya bisa dibagikan
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get(CATEGORY_PARAM) ?? "";

  const counts = new Map<string, number>();
  books.forEach((book) => book.category && counts.set(book.category, (counts.get(book.category) ?? 0) + 1));
  const categories = Array.from(counts.keys())
    .sort((a, b) => a.localeCompare(b, "id"))
    .map((name) => ({ name, slug: categorySlug(name), count: counts.get(name) ?? 0 }));

  // Slug kategori yang tidak dikenal diperlakukan sebagai "Semua"
  const activeCategory = categories.find((category) => category.slug === activeSlug) ?? null;
  const filteredBooks = activeCategory ? books.filter((book) => book.category === activeCategory.name) : books;

  const selectCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set(CATEGORY_PARAM, slug);
    else params.delete(CATEGORY_PARAM);
    const query = params.toString();
    // replaceState tersinkron dengan useSearchParams, tanpa memuat ulang data dari server
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  const tabs = [{ name: t("books.all"), slug: "", count: books.length }, ...categories];

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <AnimateOnScroll immediate>
          <SectionHeader
            tag={t("books.tag")}
            title={
              <>
                {t("books.title")} <span className="ed-accent-em">{t("books.title-emphasis")}</span>
              </>
            }
            description={t("books.description")}
          />
        </AnimateOnScroll>

        {/* Filter kategori — section bar ala koran, senada dengan filter tag di blog */}
        {categories.length > 1 && (
          <nav aria-label={t("books.filter-label")} className="mb-10 border-y border-[var(--ed-border)]">
            <div className="ed-scroll-x flex gap-x-7 md:flex-wrap">
              {tabs.map((tab) => {
                const isActive = (activeCategory?.slug ?? "") === tab.slug;
                return (
                  <button
                    key={tab.slug || "semua"}
                    type="button"
                    aria-pressed={isActive}
                    onClick={(e) => {
                      selectCategory(tab.slug);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                    }}
                    className={`relative flex-shrink-0 cursor-pointer whitespace-nowrap py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${isActive ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-muted)] hover:text-[var(--ed-text-secondary)]"}`}
                  >
                    {tab.name}
                    <sup className="ml-1 text-[9px] tracking-normal tabular-nums">{tab.count}</sup>
                    {isActive && <motion.span layoutId="book-category-underline" className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-accent)]" transition={{ duration: 0.3, ease: "easeOut" }} />}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {filteredBooks.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
            {filteredBooks.map((book, index) => {
              const enter = enterOnLoad(index, 4, 60);
              return (
                <motion.li key={book.id} className={enter?.className} style={enter?.style} initial={enter ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}>
                  <BookCard book={book} />
                </motion.li>
              );
            })}
          </ul>
        ) : (
          // Tampilan kosong — belum ada buku Published
          <div className="border-y border-[var(--ed-border)] px-4 py-20 text-center">
            <p className="ed-serif text-2xl italic tracking-tight text-[var(--ed-text)]">{t("books.empty-title")}</p>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--ed-text-secondary)]">{t("books.empty-description")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
