import { NextRequest, NextResponse } from "next/server";
import { getInternalBookBySlug } from "@/services/books/bookServices";
import { downloadRequestSchema, type DownloadResponse } from "@/services/books/downloadSchema";
import { getBookPdf } from "@/services/books/drive";
import { sendBookEmail } from "@/services/books/email";
import { hasRecentRequest, saveReader } from "@/services/books/readerServices";
import { verifyTurnstile } from "@/services/books/turnstile";

// Mengambil PDF dari Drive lalu mengirimnya lewat Resend bisa makan beberapa detik
export const maxDuration = 60;

const GENERIC_ERROR = "Maaf, ebook belum berhasil dikirim. Silakan coba lagi beberapa saat lagi.";

// Permintaan yang sedang diproses di instance ini — menahan klik ganda sebelum baris Pembaca tersimpan
const inFlight = new Set<string>();

const json = (body: DownloadResponse, status = 200) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  // 1. Validasi input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Permintaan tidak valid." }, 400);
  }

  // 2. Honeypot terisi → bot. Balas sukses palsu tanpa melakukan apa pun.
  const honeypot = (body as { hpCheck?: unknown } | null)?.hpCheck;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.warn("[books/download] Honeypot terisi, permintaan diabaikan (dianggap bot)");
    return json({ ok: true });
  }

  const parsed = downloadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Data belum lengkap. Periksa kembali alamat email Anda." }, 400);
  }

  const { slug, consent, turnstileToken } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const name = parsed.data.name || undefined;

  // 3. Verifikasi Turnstile
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const human = turnstileToken ? await verifyTurnstile(turnstileToken, ip) : false;
    if (!human) {
      return json({ ok: false, error: "Verifikasi keamanan gagal. Muat ulang halaman, lalu coba lagi." }, 403);
    }
  } catch (error) {
    console.error("[books/download] Verifikasi Turnstile gagal:", error);
    return json({ ok: false, error: GENERIC_ERROR }, 500);
  }

  // 4. Ambil buku (hanya Published) beserta Drive File ID
  let book;
  try {
    book = await getInternalBookBySlug(slug);
  } catch (error) {
    console.error("[books/download] Gagal mengambil buku dari Notion:", error);
    return json({ ok: false, error: GENERIC_ERROR }, 502);
  }
  if (!book) {
    return json({ ok: false, error: "Buku tidak ditemukan." }, 404);
  }
  if (!book.driveFileId) {
    console.error(`[books/download] Buku "${slug}" belum punya Drive File ID`);
    return json({ ok: false, error: GENERIC_ERROR }, 500);
  }

  const requestKey = `${email}|${book.id}`;
  if (inFlight.has(requestKey)) {
    return json({ ok: true, alreadySent: true });
  }
  inFlight.add(requestKey);

  try {
    // 5. Cegah kirim berulang dalam 10 menit
    try {
      if (await hasRecentRequest(email, book.id)) {
        return json({ ok: true, alreadySent: true });
      }
    } catch (error) {
      // Lebih baik sesekali terkirim dua kali daripada pengunjung tidak menerima ebook sama sekali
      console.error("[books/download] Gagal memeriksa database Pembaca:", error);
    }

    // 6–7. Ambil PDF dari Drive, lalu kirim sebagai lampiran
    try {
      const pdf = await getBookPdf(book.driveFileId);
      await sendBookEmail({ to: email, name, title: book.title, slug: book.slug, pdf });
    } catch (error) {
      console.error(`[books/download] Gagal mengirim ebook "${slug}":`, error);
      return json({ ok: false, error: GENERIC_ERROR }, 502);
    }

    // 8. Catat ke database Pembaca. Email sudah terkirim, jadi kegagalan di sini cukup dicatat di log.
    try {
      await saveReader({ email, name, bookId: book.id, consent });
    } catch (error) {
      console.error(`[books/download] Email terkirim, tetapi gagal menyimpan Pembaca (buku "${slug}"):`, error);
    }

    // 9. Selesai
    return json({ ok: true });
  } finally {
    inFlight.delete(requestKey);
  }
}
