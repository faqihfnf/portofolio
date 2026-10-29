import { getData } from "@/services/notionServices";
import BlogListClient from "@/components/sections/blog/BlogListClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HR, Organizational Development, and Technology Blog",
  description: "Articles and reflections by Faqih Nur Fahmi on HR management, organizational development, digital transformation, software development, and practical workplace solutions.",
  alternates: { canonical: "/blog" },
  // Tanpa ini og:title halaman /blog ikut judul homepage dari root layout
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: "Faqih Nur Fahmi",
    title: "Blog — Faqih Nur Fahmi",
    description: "Articles and reflections on HR management, organizational development, and technology.",
    // openGraph di sini menimpa milik root, jadi gambar dari src/app/opengraph-image.tsx harus disebut ulang
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Faqih Nur Fahmi — HR Manager and Full Stack Developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Faqih Nur Fahmi",
    description: "Articles and reflections on HR management, organizational development, and technology.",
  },
};

export default async function BlogList() {
  const posts = await getData();

  return <BlogListClient posts={posts} />;
}
