import { Metadata } from "next";
import BookListClient from "@/components/sections/books/BookListClient";
import { getBooks } from "@/services/books/bookServices";

// ISR: halaman disajikan dari cache dan dibuat ulang di latar belakang paling sering tiap 5 menit.
// Aman karena URL gambar sudah permanen (disalin ke R2), tidak lagi URL Notion yang kedaluwarsa ±1 jam.
export const revalidate = 300;

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
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Faqih Nur Fahmi — HR Manager dan Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buku dan Ebook Gratis — Faqih Nur Fahmi",
    description,
  },
};

export default async function BooksPage() {
  const books = await getBooks();

  // Tanpa <Suspense>: BookListClient membaca ?kategori= dari URL browser, bukan useSearchParams
  return <BookListClient books={books} />;
}
