import type { MetadataRoute } from "next";
import { getData, getProjects } from "@/services/notionServices";
import { getBooks } from "@/services/books/bookServices";

const baseUrl = "https://faqih.id";

// Sitemap ikut memuat artikel, project & buku dari Notion; dibangun ulang paling lama tiap 1 jam
export const revalidate = 3600;

const staticPages: MetadataRoute.Sitemap = [
  { url: baseUrl, changeFrequency: "monthly", priority: 1 },
  { url: `${baseUrl}/experiences`, changeFrequency: "yearly", priority: 0.9 },
  { url: `${baseUrl}/projects`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/certificates`, changeFrequency: "yearly", priority: 0.8 },
  { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${baseUrl}/books`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${baseUrl}/course`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Kalau Notion sedang bermasalah, halaman statis tetap tersaji
  const [posts, projects, books] = await Promise.all([getData().catch(() => []), getProjects().catch(() => []), getBooks().catch(() => [])]);

  const postPages: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug)
    .map((post) => {
      const lastModified = post.updatedAt ?? post.date;
      return {
        url: `${baseUrl}/blog/${post.slug}`,
        ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

  const projectPages: MetadataRoute.Sitemap = projects
    .filter((project) => project.slug)
    .map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  const bookPages: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${baseUrl}/books/${book.slug}`,
    ...(book.publishedAt ? { lastModified: new Date(book.publishedAt) } : {}),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...projectPages, ...bookPages];
}
