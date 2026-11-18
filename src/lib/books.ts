import { AUTHOR_NAME } from "@/data/books";
import type { Book } from "@/services/books/types";

// Helper tampilan buku — aman dipakai di server maupun client

/** Aksara Arab (U+0600–U+06FF) */
const ARABIC_SCRIPT = /[؀-ۿ]/;

export const hasArabicScript = (text: string) => ARABIC_SCRIPT.test(text);

/** Nama penerjemah yang ditampilkan; kalau kosong di Notion dianggap pemilik situs */
export const getTranslatorName = (book: Book) => book.translator ?? AUTHOR_NAME;

/** Nama penulis yang ditampilkan; Karya Sendiri tanpa Penulis otomatis memakai nama pemilik situs */
export const getAuthorName = (book: Book) => book.author ?? (book.type === "original" ? AUTHOR_NAME : null);

/** Label baris penulis per bahasa — default Bahasa Indonesia */
export interface AuthorLineLabels {
  by: (name: string) => string;
  workOf: (author: string) => string;
  translatedBy: (name: string) => string;
}

const ID_AUTHOR_LABELS: AuthorLineLabels = {
  by: (name) => `Oleh ${name}`,
  workOf: (author) => `Karya ${author}`,
  translatedBy: (name) => `Diterjemahkan oleh ${name}`,
};

/**
 * Baris penulis:
 * - Karya Sendiri → "Oleh {Penulis}"
 * - Terjemahan    → "Karya {Penulis} · Diterjemahkan oleh {Penerjemah}"
 */
export function getAuthorLine(book: Book, labels: AuthorLineLabels = ID_AUTHOR_LABELS): string {
  if (book.type === "translation") {
    const translator = labels.translatedBy(getTranslatorName(book));
    return book.author ? `${labels.workOf(book.author)} · ${translator}` : translator;
  }
  return labels.by(getAuthorName(book) ?? AUTHOR_NAME);
}

export const isSamePerson = (name: string | null) => !name || name.trim().toLowerCase() === AUTHOR_NAME.toLowerCase();

/** "HR & Karier" → "hr-karier" — dipakai untuk query param ?kategori= */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Buku Lainnya: buku dari kategori yang sama lebih dulu. Kalau kategori itu
 * berisi kurang dari 3 buku lain, sisanya diisi buku terbaru.
 */
export function pickOtherBooks(current: Book, books: Book[], limit = 4): Book[] {
  const others = books.filter((book) => book.id !== current.id);
  const sameCategory = others.filter((book) => current.category && book.category === current.category);
  if (sameCategory.length >= 3) return sameCategory.slice(0, limit);

  const rest = others.filter((book) => !sameCategory.includes(book));
  return [...sameCategory, ...rest].slice(0, limit);
}
