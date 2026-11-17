import type { NotionBlock } from "@/services/notionServices";

// ============================================================
// Tipe data Buku
// `Book` aman dikirim ke browser. `InternalBook` (lihat bookServices.ts) menambahkan
// Drive File ID dan hanya boleh hidup di server.
// ============================================================

export type BookType = "translation" | "original";

export interface BookImage {
  url: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  type: BookType;
  category: string | null;
  topics: string[];
  author: string | null;
  translator: string | null;
  originalTitle: string | null;
  originalLanguage: string | null;
  synopsis: string;
  pageCount: number | null;
  fileSize: string | null;
  edition: string | null;
  publishedAt: string | null;
  cover: string | null;
  previews: BookImage[];
  /** Belum dipakai — disiapkan untuk buku berbayar */
  price: number;
}

export interface BookFaqItem {
  id: string;
  /** judul toggle */
  question: string;
  /** isi toggle */
  answer: NotionBlock[];
}

/** Body halaman Notion yang sudah dipecah per Heading 2. Bagian kosong bernilai array kosong. */
export interface BookSections {
  description: NotionBlock[];
  toc: NotionBlock[];
  aboutAuthor: NotionBlock[];
  faq: BookFaqItem[];
}
