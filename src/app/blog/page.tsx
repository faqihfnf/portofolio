import { getData } from "@/services/notionServices";
import BlogListClient from "@/components/sections/blog/BlogListClient";
import { Metadata } from "next";

// ISR: halaman disajikan dari cache dan dibuat ulang di latar belakang paling sering tiap 5 menit.
// Aman karena URL gambar sudah permanen (disalin ke R2), tidak lagi URL Notion yang kedaluwarsa ±1 jam.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog HR, Pengembangan Organisasi, dan Teknologi",
  description: "Artikel dan refleksi Faqih Nur Fahmi tentang manajemen SDM, pengembangan organisasi, transformasi digital, pengembangan software, dan solusi praktis di tempat kerja.",
  alternates: { canonical: "/blog" },
  // Tanpa ini og:title halaman /blog ikut judul homepage dari root layout
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: "Faqih Nur Fahmi",
    title: "Blog — Faqih Nur Fahmi",
    description: "Artikel dan refleksi tentang manajemen SDM, pengembangan organisasi, dan teknologi.",
    // openGraph di sini menimpa milik root, jadi gambar dari src/app/opengraph-image.tsx harus disebut ulang
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Faqih Nur Fahmi — HR Manager dan Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Faqih Nur Fahmi",
    description: "Artikel dan refleksi tentang manajemen SDM, pengembangan organisasi, dan teknologi.",
  },
};

export default async function BlogList() {
  const posts = await getData();

  return <BlogListClient posts={posts} />;
}
