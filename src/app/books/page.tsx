import { Suspense } from "react";
import { Metadata } from "next";
import BookListClient from "@/components/sections/books/BookListClient";
import { getBooks } from "@/services/books/bookServices";

// Mengikuti pola blog: render dinamis + cache in-memory 30 menit di service.
// URL gambar dari Notion kedaluwarsa ±1 jam, jadi halaman tidak di-cache sebagai HTML statis.
export const dynamic = "force-dynamic";

const description = "Kumpulan ebook gratis karya dan terjemahan Faqih Nur Fahmi dalam format PDF. Masukkan email Anda, dan file dikirim langsung ke inbox.";

export const metadata: Metadata = {
  title: "Buku dan Ebook Gratis",
  description,
  alternates: { canonical: "/books" },
  openGraph: {
    type: "website",
    url: "/books",
    siteName: "Faqih Nur Fahmi",
    locale: "id_ID",
    title: "Buku dan Ebook Gratis — Faqih Nur Fahmi",
    description,
    // openGraph di sini menimpa milik root, jadi gambar dari src/app/opengraph-image.tsx harus disebut ulang
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Faqih Nur Fahmi — HR Manager and Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buku dan Ebook Gratis — Faqih Nur Fahmi",
    description,
  },
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    // BookListClient membaca ?kategori= lewat useSearchParams
    <Suspense>
      <BookListClient books={books} />
    </Suspense>
  );
}
