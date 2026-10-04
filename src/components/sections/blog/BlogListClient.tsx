"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/services/notionServices";
import { useTranslation } from "react-i18next";
import SectionHeader from "@/components/editorial/SectionHeader";
import { fraunces, inter } from "@/components/editorial/fonts";
import { EditorialButton } from "@/components/editorial/EditorialButton";

interface BlogListClientProps {
  posts: BlogPost[];
}

const INITIAL_COUNT = 5;

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const tagScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tagCounts = new Map<string, number>([["All", posts.length]]);
  posts.flatMap((post) => post.tags).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  const allTags = ["All", ...Array.from(tagCounts.keys()).filter((tag) => tag !== "All").sort()];
  const filteredPosts = selectedTag === "All" ? posts : posts.filter((post) => post.tags.includes(selectedTag));

  // Tampilkan panah kiri/kanan hanya jika masih ada tag tersembunyi di arah itu
  const updateScrollArrows = () => {
    const el = tagScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = tagScrollRef.current;
    if (!el) return;
    updateScrollArrows();
    const observer = new ResizeObserver(updateScrollArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, [allTags.length]);

  const scrollTags = (direction: -1 | 1) => {
    const el = tagScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: "smooth" });
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + INITIAL_COUNT, filteredPosts.length));
  };

  const { t } = useTranslation();

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <SectionHeader tag="Blog" title={t("blog.title")} description={t("blog.description")} />

        {/* Filter tag — section bar ala koran: hairline atas-bawah, 1 baris, scroll horizontal di mobile */}
        {allTags.length > 1 && (
          <nav aria-label="Filter tag" className="relative mb-8 border-y border-[var(--ed-border)]">
            {/* Panah carousel — hanya mobile, karena di desktop tag di-wrap */}
            <button
              type="button"
              aria-label="Geser tag ke kiri"
              onClick={() => scrollTags(-1)}
              className={`absolute inset-y-0 left-0 z-10 flex w-12 cursor-pointer items-center justify-start bg-gradient-to-r from-[var(--ed-bg)] from-50% to-transparent text-[var(--ed-text-secondary)] transition-opacity duration-200 hover:text-[var(--ed-accent)] md:hidden ${canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Geser tag ke kanan"
              onClick={() => scrollTags(1)}
              className={`absolute inset-y-0 right-0 z-10 flex w-12 cursor-pointer items-center justify-end bg-gradient-to-l from-[var(--ed-bg)] from-50% to-transparent text-[var(--ed-text-secondary)] transition-opacity duration-200 hover:text-[var(--ed-accent)] md:hidden ${canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>

            <div ref={tagScrollRef} onScroll={updateScrollArrows} className="ed-scroll-x flex gap-x-7 md:flex-wrap">
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isActive}
                    onClick={(e) => {
                      setSelectedTag(tag);
                      setVisibleCount(INITIAL_COUNT);
                      e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                    }}
                    className={`relative flex-shrink-0 cursor-pointer whitespace-nowrap py-3.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${isActive ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-muted)] hover:text-[var(--ed-text-secondary)]"}`}
                  >
                    {tag}
                    <sup className="ml-1 text-[9px] tracking-normal tabular-nums">{tagCounts.get(tag)}</sup>
                    {isActive && <motion.span layoutId="blog-tag-underline" className="absolute inset-x-0 bottom-0 h-px bg-[var(--ed-accent)]" transition={{ duration: 0.3, ease: "easeOut" }} />}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Daftar artikel — dengan thumbnail seperti sebelumnya */}
        <ol className="border-t border-[var(--ed-border)]">
          {filteredPosts.slice(0, visibleCount).map((post, index) => (
            <motion.li
              key={post.id}
              className="border-b border-[var(--ed-border)] py-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (index % 8) * 0.06 }}
            >
              <Link href={`/blog/${post.slug ?? ""}`} className="group flex flex-col gap-5 sm:flex-row-reverse sm:gap-8">
                {/* Thumbnail — kanan seperti sebelumnya */}
                {post.cover && (
                  <div className="flex-shrink-0 sm:h-[120px] sm:w-[180px]">
                    <img src={post.cover} alt={post.title} className="h-44 w-full rounded-[2px] border border-[var(--ed-border)] object-cover sm:h-full" />
                  </div>
                )}

                {/* Content — kiri */}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">
                    {post.date && (
                      <span>
                        {new Date(post.date).toLocaleDateString("id-ID", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {post.tags.length > 0 && <span className="hidden sm:inline">·</span>}
                    {post.tags.length > 0 && <span className="hidden sm:inline">{post.tags.slice(0, 3).join(" · ")}</span>}
                  </div>

                  <h2 className="ed-serif mt-2 text-xl leading-snug tracking-tight transition-colors group-hover:text-[var(--ed-accent)]">{post.title}</h2>

                  {post.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ed-text-secondary)]">{post.description}</p>}
                </div>
              </Link>
            </motion.li>
          ))}
        </ol>

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <p className="py-20 text-center text-[var(--ed-text-muted)]">
            Tidak ada post dengan tag <span className="text-[var(--ed-text-secondary)]">{selectedTag}</span>.
          </p>
        )}

        {/* Load More */}
        {visibleCount < filteredPosts.length && (
          <div className="mt-10 text-center">
            <EditorialButton type="button" onClick={handleLoadMore} variant="primary">
              Load More
            </EditorialButton>
          </div>
        )}
      </section>
    </div>
  );
}
