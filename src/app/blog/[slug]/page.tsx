import { getData, getPageBlocks } from "@/services/notionServices";
import TableOfContents from "../../../components/sections/blog/TableOfContents";
import Link from "next/link";
import { blockRichText, plainTextOf, type NotionBlock } from "@/lib/notionBlocks";
import NotionBlockRenderer from "../../../components/sections/blog/NotionBlockRenderer";
import RelatedPosts from "../../../components/sections/blog/RelatedPosts";
import { Metadata } from "next";
import { fraunces, inter } from "@/components/editorial/fonts";
import { ArrowLeft } from "lucide-react";
import ShareMenu from "@/components/editorial/ShareMenu";
import { notFound } from "next/navigation";
import NotionImage from "@/components/ui/NotionImage";

// ISR: halaman disajikan dari cache dan dibuat ulang di latar belakang paling sering tiap 5 menit.
// Aman karena URL gambar sudah permanen (disalin ke R2), tidak lagi URL Notion yang kedaluwarsa ±1 jam.
export const revalidate = 300;

// Semua artikel dibuat saat build. Kalau Notion gagal diakses saat build, daftar dikosongkan
// supaya deploy tidak gagal — halaman lalu dibuat saat pertama dibuka (dynamicParams default true).
export async function generateStaticParams() {
  try {
    const items = await getData();
    return items.filter((item) => item.slug).map((item) => ({ slug: item.slug as string }));
  } catch (error) {
    console.error("[generateStaticParams] Gagal mengambil daftar artikel dari Notion:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata untuk SEO dan Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getData();
  const page = posts.find((p) => p.slug === slug);

  if (!page) notFound();

  // Gunakan description dari Notion, atau fallback
  const description = page.description || `Baca artikel ${page.title} oleh Faqih Nur Fahmi`;

  return {
    // Suffix "| Faqih Nur Fahmi" sudah ditambahkan oleh title.template di root layout
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      type: "article",
      url: `https://faqih.id/blog/${slug}`,
      // og:image diisi otomatis oleh ./opengraph-image.tsx (cover Notion di-proxy ke URL permanen)
      siteName: "Faqih Nur Fahmi",
      publishedTime: page.date || undefined,
      modifiedTime: page.updatedAt || undefined,
      authors: ["Faqih Nur Fahmi"],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
    },
    alternates: {
      canonical: `https://faqih.id/blog/${slug}`,
    },
  };
}

// Extract headings dari blocks untuk TOC
function extractHeadings(blocks: NotionBlock[]) {
  return blocks
    .filter((b) => ["heading_1", "heading_2", "heading_3"].includes(b.type))
    .map((b) => {
      const title = plainTextOf(blockRichText(b));
      const level = b.type === "heading_1" ? 1 : b.type === "heading_2" ? 2 : 3;
      return {
        id: b.id.replace(/-/g, ""),
        title,
        level,
      };
    })
    .filter((h) => h.title.trim() !== "");
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const posts = await getData();
  const page = posts.find((p) => p.slug === slug);
  // Slug tidak dikenal → status 404 asli + halaman not-found, bukan 200 (soft 404)
  if (!page) notFound();

  const blocks = await getPageBlocks(page.id);
  const headings = extractHeadings(blocks);

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <Link href="/blog" className="ed-link inline-block text-[11px] uppercase tracking-[0.18em]">
          <ArrowLeft className="mr-1 size-4 inline-block" />
          Blog
        </Link>

        {/* Header */}
        <h1 className="ed-serif mt-8 text-3xl leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.2]">{page.title}</h1>

        {/* Meta: tanggal + kategori kecil */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">
          {page.date && (
            <span>
              {new Date(page.date).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          {page.tags.length > 0 && <span>{page.tags.slice(0, 3).join(" · ")}</span>}
          <ShareMenu url={`https://faqih.id/blog/${slug}`} text={page.title} />
        </div>

        {/* Cover image */}
        {page.cover && <NotionImage src={page.cover} alt={page.title} width={1200} height={630} sizes="(min-width: 1024px) 944px, 100vw" preload className="mt-8 aspect-[1200/630] w-full rounded-lg border border-[var(--ed-border)] object-cover" />}

        <div className="mt-8  border-[var(--ed-border)] pt-10">
          {/* Mobile TOC Dropdown */}
          {headings.length > 0 && <TableOfContents headings={headings} variant="dropdown" />}

          <div className="flex min-w-0 gap-12">
            {/* Content utama */}
            <div className="min-w-0 max-w-[640px] flex-1 overflow-hidden">
              <NotionBlockRenderer blocks={blocks} />
            </div>

            {/* Sidebar TOC */}
            {headings.length > 0 && (
              <div className="hidden w-60 flex-shrink-0 lg:block">
                <div className="sticky top-24">
                  <TableOfContents headings={headings} />
                </div>
              </div>
            )}
          </div>
        </div>

        <RelatedPosts current={page} posts={posts} />
      </div>
    </div>
  );
}
