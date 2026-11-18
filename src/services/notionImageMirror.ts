import "server-only";

import { AwsClient } from "aws4fetch";

// ============================================================
// Salin gambar unggahan Notion ke Cloudflare R2, lalu tampilkan dari CDN (mis. cdn.faqih.id).
//
// URL file Notion bertanda tangan dan kedaluwarsa ±1 jam, dilayani dari S3 Amerika tanpa CDN.
// Alurnya:
//   1. Saat data Notion diambil, setiap URL file Notion diberi kunci tetap: notion/{ID-file}/{nama-file}.
//      ID file sama untuk file yang sama, dan berubah kalau gambar diganti di Notion.
//   2. Sudah ada di R2 → URL diganti ke CDN.
//   3. Belum ada → gambar disalin ke R2 saat itu juga, lalu URL CDN yang dipakai. Halaman Notion memakai
//      ISR (dibuat ulang di latar belakang), jadi waktu salin tidak dirasakan pengunjung, dan HTML yang
//      di-cache selalu berisi URL permanen — bukan URL Notion yang kedaluwarsa.
// Kalau R2 belum dikonfigurasi atau penyalinan gagal, URL Notion dipakai apa adanya — gambar tidak rusak.
// ============================================================

const MAX_BYTES = 20 * 1024 * 1024;
const CHECK_TIMEOUT_MS = 3_000;
const COPY_TIMEOUT_MS = 30_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface R2Config {
  client: AwsClient;
  /** https://{account}.r2.cloudflarestorage.com/{bucket} */
  bucketUrl: string;
  /** https://cdn.faqih.id */
  publicUrl: string;
}

let config: R2Config | null | undefined;

function getConfig(): R2Config | null {
  if (config !== undefined) return config;
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
    config = null;
    return config;
  }
  config = {
    // Host R2 tidak bisa ditebak aws4fetch, jadi service dan region ditulis eksplisit
    client: new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto", retries: 2 }),
    bucketUrl: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`,
    publicUrl: R2_PUBLIC_URL.replace(/\/+$/, ""),
  };
  return config;
}

/** Kunci yang sudah dipastikan ada di R2 (per instance server) — supaya tidak dicek ulang */
const knownInR2 = new Set<string>();
/** Penyalinan yang sedang berjalan — mencegah file yang sama disalin dua kali bersamaan */
const copying = new Map<string, Promise<void>>();

/**
 * Kunci R2 untuk URL file unggahan Notion, atau null kalau bukan file Notion (mis. link eksternal).
 * Format URL Notion: https://prod-files-secure.s3.us-west-2.amazonaws.com/{workspace}/{ID-file}/{nama}?...
 */
export function notionFileKey(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!parsed.hostname.endsWith(".amazonaws.com")) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const fileId = segments[segments.length - 2];
  if (!UUID.test(fileId)) return null;

  let name: string;
  try {
    name = decodeURIComponent(segments[segments.length - 1]);
  } catch {
    name = segments[segments.length - 1];
  }
  // Nama file aman untuk URL: huruf, angka, titik, minus, garis bawah
  const safeName = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  return `notion/${fileId.toLowerCase()}/${safeName}`;
}

async function existsInR2(cfg: R2Config, key: string): Promise<boolean> {
  const res = await cfg.client.fetch(`${cfg.bucketUrl}/${key}`, { method: "HEAD", signal: AbortSignal.timeout(CHECK_TIMEOUT_MS) });
  if (res.ok) return true;
  if (res.status === 404) return false;
  throw new Error(`R2 HEAD ${key} membalas status ${res.status}`);
}

async function copyToR2(cfg: R2Config, sourceUrl: string, key: string): Promise<void> {
  // Tanpa cache: "no-store" — opsi itu membuat halaman ISR berubah menjadi dinamis
  const source = await fetch(sourceUrl, { signal: AbortSignal.timeout(COPY_TIMEOUT_MS) });
  if (!source.ok) throw new Error(`Gagal mengunduh file Notion (${source.status})`);

  const body = await source.arrayBuffer();
  if (body.byteLength > MAX_BYTES) throw new Error(`File terlalu besar untuk disalin (${(body.byteLength / 1024 / 1024).toFixed(1)} MB)`);

  // Hanya tanda tangan dari aws4fetch; request dikirim sendiri dengan body ArrayBuffer. Kalau dikirim lewat
  // client.fetch, body menjadi stream tanpa Content-Length dan R2 menolaknya (411 Length Required).
  const signed = await cfg.client.sign(`${cfg.bucketUrl}/${key}`, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": source.headers.get("content-type") ?? "application/octet-stream",
      // Kunci unik per versi gambar, jadi aman di-cache selamanya
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
  const res = await fetch(signed.url, {
    method: "PUT",
    headers: signed.headers,
    body,
    signal: AbortSignal.timeout(COPY_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`R2 PUT ${key} membalas status ${res.status}`);
  knownInR2.add(key);
}

/** Salin sekali saja per kunci, walau diminta beberapa halaman bersamaan */
function copyOnce(cfg: R2Config, sourceUrl: string, key: string): Promise<void> {
  let job = copying.get(key);
  if (!job) {
    job = copyToR2(cfg, sourceUrl, key)
      .then(() => console.info(`[notion-image] Tersalin ke R2: ${key}`))
      .finally(() => copying.delete(key));
    copying.set(key, job);
  }
  return job;
}

/**
 * Ganti URL file Notion dengan URL CDN. Gambar yang belum ada di R2 disalin dulu.
 * URL selain file Notion, atau saat terjadi error, dikembalikan apa adanya.
 */
export async function mirrorNotionUrl(url: string): Promise<string> {
  const cfg = getConfig();
  if (!cfg) return url;

  const key = notionFileKey(url);
  if (!key) return url;
  const cdnUrl = `${cfg.publicUrl}/${key}`;
  if (knownInR2.has(key)) return cdnUrl;

  try {
    if (await existsInR2(cfg, key)) {
      knownInR2.add(key);
      return cdnUrl;
    }
  } catch (error) {
    console.error(`[notion-image] Gagal memeriksa ${key} di R2:`, error);
    return url;
  }

  try {
    await copyOnce(cfg, url, key);
    return cdnUrl;
  } catch (error) {
    console.error(`[notion-image] Gagal menyalin ${key}:`, error);
    return url;
  }
}

/** mirrorNotionUrl untuk banyak URL sekaligus (diperiksa paralel) */
export async function mirrorNotionUrls<T extends string | null>(urls: T[]): Promise<T[]> {
  return Promise.all(urls.map((url) => (url ? mirrorNotionUrl(url) : url))) as Promise<T[]>;
}
