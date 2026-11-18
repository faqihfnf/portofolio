import { ImageResponse } from "next/og";
import { getAuthorLine } from "@/lib/books";
import { getBooks } from "@/services/books/bookServices";

export const alt = "Ebook Faqih Nur Fahmi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// URL cover dari Notion adalah signed S3 URL yang kedaluwarsa dalam 1 jam, jadi tidak bisa
// dipakai langsung sebagai og:image. Di sini cover diambil saat itu juga lalu disajikan ulang
// dari URL faqih.id yang permanen (pola yang sama dengan blog).
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
  const books = await getBooks();
  const book = books.find((b) => b.slug === slug);
  const cover = book?.cover ? await loadCover(book.cover) : null;
  const title = book?.title ?? "Buku";

  // Cover buku berbentuk potret, jadi ditaruh di kiri kartu editorial — bukan dipotong memenuhi 1200×630
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#F4F3EF",
        padding: "0 80px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) hanya mendukung <img> */}
      {cover && <img src={cover} alt="" height={470} style={{ height: 470, maxWidth: 360, objectFit: "contain", border: "1px solid #D8D6CE", marginRight: 64 }} />}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 24, letterSpacing: 6, color: "#8A6F3F" }}>FAQIH.ID / BUKU</div>
        <div style={{ fontSize: title.length > 40 ? 52 : 64, fontWeight: 700, color: "#1B1C1E", lineHeight: 1.1, marginTop: 24 }}>{title}</div>
        <div style={{ width: 96, height: 5, backgroundColor: "#8A6F3F", marginTop: 36, marginBottom: 28 }} />
        <div style={{ fontSize: 28, color: "#4A4A46" }}>{book ? getAuthorLine(book) : "Faqih Nur Fahmi"}</div>
      </div>
    </div>,
    { ...size },
  );
}
