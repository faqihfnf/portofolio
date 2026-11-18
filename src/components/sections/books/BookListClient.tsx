"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { fraunces, inter } from "@/components/editorial/fonts";
import { AnimateOnScroll, enterOnLoad } from "@/components/ui/animate-on-scroll";
import type { Book } from "@/services/books/types";
import BookCard from "./BookCard";

const ALL = "All";

// Pencarian dan filter topik mengikuti halaman blog: state biasa, URL tidak berubah.
export default function BookListClient({ books }: { books: Book[] }) {
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const topicScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const topicCounts = new Map<string, number>([[ALL, books.length]]);
  books.flatMap((book) => book.topics).forEach((topic) => topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1));
  const allTopics = [ALL, ...Array.from(topicCounts.keys()).filter((topic) => topic !== ALL).sort((a, b) => a.localeCompare(b, "id"))];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredBooks = books.filter((book) => {
    if (selectedTopic !== ALL && !book.topics.includes(selectedTopic)) return false;
    if (!normalizedQuery) return true;
    // Cari di judul (termasuk judul asli), penulis, penerjemah, sinopsis, kategori, dan topik
    return [book.title, book.originalTitle, book.author, book.translator, book.synopsis, book.category, ...book.topics].some((text) => text?.toLowerCase().includes(normalizedQuery));
  });

  // Tampilkan panah kiri/kanan hanya jika masih ada topik tersembunyi di arah itu
  const updateScrollArrows = () => {
    const el = topicScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = topicScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    const observer = new ResizeObserver(updateScrollArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [allTopics.length]);

  const scrollTopics = (direction: -1 | 1) => {
    const el = topicScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: "smooth" });
  };

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

        {/* Search bar — sama dengan halaman blog: garis bawah saja */}
        {books.length > 0 && (
          <div className="relative mb-6 flex items-center border-b border-[var(--ed-border)] transition-colors focus-within:border-[var(--ed-accent)]">
            <Search size={16} strokeWidth={1.5} className="pointer-events-none flex-shrink-0 text-[var(--ed-text-muted)]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("books.search-placeholder")}
              aria-label={t("books.search-placeholder")}
              className="w-full bg-transparent px-3 py-3 text-sm text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label={t("books.clear-search")}
                onClick={() => setSearchQuery("")}
                className="flex-shrink-0 cursor-pointer text-[var(--ed-text-muted)] transition-colors hover:text-[var(--ed-accent)]"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

        {/* Filter topik — section bar ala koran, sama dengan filter tag di blog: 1 baris, scroll horizontal di mobile */}
        {allTopics.length > 1 && (
          <nav aria-label={t("books.filter-label")} className="relative mb-10 border-y border-[var(--ed-border)]">
            {/* Panah carousel — hanya mobile, karena di desktop topik di-wrap */}
            <button
              type="button"
              aria-label={t("books.scroll-left")}
              onClick={() => scrollTopics(-1)}
              className={`absolute inset-y-0 left-0 z-10 flex w-12 cursor-pointer items-center justify-start bg-gradient-to-r from-[var(--ed-bg)] from-50% to-transparent text-[var(--ed-text-secondary)] transition-opacity duration-200 hover:text-[var(--ed-accent)] md:hidden ${canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={t("books.scroll-right")}
              onClick={() => scrollTopics(1)}
              className={`absolute inset-y-0 right-0 z-10 flex w-12 cursor-pointer items-center justify-end bg-gradient-to-l from-[var(--ed-bg)] from-50% to-transparent text-[var(--ed-text-secondary)] transition-opacity duration-200 hover:text-[var(--ed-accent)] md:hidden ${canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>

            <div ref={topicScrollRef} onScroll={updateScrollArrows} className="ed-scroll-x flex gap-x-7 md:flex-wrap">
              {allTopics.map((topic) => {
                const isActive = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={isActive}
                    onClick={(e) => {
                      setSelectedTopic(topic);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                    }}
                    className={`relative flex-shrink-0 cursor-pointer whitespace-nowrap py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${isActive ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-muted)] hover:text-[var(--ed-text-secondary)]"}`}
                  >
                    {topic === ALL ? t("books.all") : topic}
                    <sup className="ml-1 text-[9px] tracking-normal tabular-nums">{topicCounts.get(topic)}</sup>
                    {isActive && <motion.span layoutId="book-topic-underline" className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-accent)]" transition={{ duration: 0.3, ease: "easeOut" }} />}
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
        ) : books.length > 0 ? (
          // Tidak ada yang cocok dengan pencarian / topik
          <p className="py-20 text-center text-[var(--ed-text-muted)]">
            {normalizedQuery ? (
              <>
                {t("books.no-search-results")} <span className="text-[var(--ed-text-secondary)]">&ldquo;{searchQuery.trim()}&rdquo;</span>
                {selectedTopic !== ALL && <> · {selectedTopic}</>}.
              </>
            ) : (
              <>
                {t("books.no-topic-results")} <span className="text-[var(--ed-text-secondary)]">{selectedTopic}</span>.
              </>
            )}
          </p>
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
