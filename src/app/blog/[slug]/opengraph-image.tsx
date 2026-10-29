import { ImageResponse } from "next/og";
import { getData } from "@/services/notionServices";

export const alt = "Artikel blog Faqih Nur Fahmi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// URL cover dari Notion adalah signed S3 URL yang kedaluwarsa dalam 1 jam, jadi tidak bisa
// dipakai langsung sebagai og:image (Facebook dkk. men-scrape belakangan → gambar gagal dimuat).
// Di sini cover diambil saat itu juga lalu disajikan ulang dari URL faqih.id yang permanen.
async function loadCover(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    // ImageResponse hanya mendukung PNG/JPEG secara andal
    if (!/image\/(png|jpe?g)/.test(type)) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await getData();
  const post = posts.find((p) => p.slug === slug);
  const cover = post?.cover ? await loadCover(post.cover) : null;

  if (cover) {
    return new ImageResponse(<img src={cover} width={size.width} height={size.height} style={{ width: "100%", height: "100%", objectFit: "cover" }} />, { ...size });
  }

  // Fallback tanpa cover — kartu editorial berisi judul artikel
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#F4F3EF",
        padding: "0 80px",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 6, color: "#8A6F3F" }}>FAQIH.ID / BLOG</div>
      <div style={{ fontSize: 68, fontWeight: 700, color: "#1B1C1E", lineHeight: 1.1, marginTop: 24 }}>{post?.title ?? "Blog"}</div>
      <div style={{ width: 96, height: 5, backgroundColor: "#8A6F3F", marginTop: 36, marginBottom: 28 }} />
      <div style={{ fontSize: 28, color: "#4A4A46" }}>Faqih Nur Fahmi</div>
    </div>,
    { ...size },
  );
}
