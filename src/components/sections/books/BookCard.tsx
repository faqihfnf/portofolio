import Link from "next/link";
import { getAuthorLine } from "@/lib/books";
import type { Book } from "@/services/books/types";

interface BookCardProps {
  book: Book;
  /** Level heading judul — h2 di daftar buku, h3 di "Buku Lainnya" */
  headingAs?: "h2" | "h3";
}

export default function BookCard({ book, headingAs: Heading = "h2" }: BookCardProps) {
  return (
    <Link href={`/books/${book.slug}`} data-no-justify className="group flex flex-col">
      <div className="aspect-[5/7] overflow-hidden rounded-lg border border-[var(--ed-border)] bg-[var(--ed-bg-elevated)]">
        {book.cover ? (
          <img src={book.cover} alt={`Sampul ${book.title}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        ) : (
          // Belum ada cover — judul sebagai pengganti
          <div className="flex h-full items-center justify-center p-5">
            <span className="ed-serif text-center text-lg italic leading-snug text-[var(--ed-text-muted)]">{book.title}</span>
          </div>
        )}
      </div>

      {book.category && <span className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">{book.category}</span>}

      <Heading className={`ed-serif text-lg leading-snug tracking-tight transition-colors group-hover:text-[var(--ed-accent)] ${book.category ? "mt-1.5" : "mt-4"}`}>{book.title}</Heading>

      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ed-text-secondary)]">{getAuthorLine(book)}</p>
    </Link>
  );
}
