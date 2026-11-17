import "server-only";

// ============================================================
// Pengambilan PDF dari Google Drive
// Seluruh logika Drive ada di file ini. Untuk pindah ke Google Drive API + service account,
// cukup ganti isi getBookPdf() — pemanggilnya tidak perlu diubah.
// ============================================================

// Batas lampiran Resend 40 MB setelah Base64 (±1,37× ukuran asli)
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const PDF_SIGNATURE = "%PDF";

/** Ambil file PDF dari Drive (file harus "Anyone with the link can view") */
export async function getBookPdf(fileId: string): Promise<Buffer> {
  if (!/^[\w-]{10,}$/.test(fileId)) {
    throw new Error(`Drive File ID tidak valid: "${fileId}"`);
  }

  const url = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  const response = await fetch(url, { redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(30_000) });

  if (!response.ok) {
    throw new Error(`Google Drive membalas status ${response.status} untuk file ${fileId}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // File privat, ID salah, atau kuota unduhan habis → Drive membalas halaman HTML, bukan PDF
  if (buffer.subarray(0, PDF_SIGNATURE.length).toString("latin1") !== PDF_SIGNATURE) {
    const contentType = response.headers.get("content-type") ?? "tidak diketahui";
    throw new Error(`File Drive ${fileId} bukan PDF (content-type: ${contentType}). Periksa Drive File ID dan pastikan aksesnya "Anyone with the link".`);
  }

  if (buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error(`File Drive ${fileId} terlalu besar untuk dilampirkan (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB)`);
  }

  return buffer;
}
