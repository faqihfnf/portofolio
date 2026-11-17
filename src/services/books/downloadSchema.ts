import { z } from "zod";

// ============================================================
// Skema form unduh — dipakai bersama oleh form (client) dan route handler (server)
// ============================================================

/** Field yang diisi pengunjung */
export const downloadFormSchema = z.object({
  name: z.string().trim().max(100, "Nama terlalu panjang"),
  email: z.string().trim().min(1, "Email wajib diisi").max(254, "Email terlalu panjang").email("Format email belum benar"),
  consent: z.boolean(),
  /**
   * Honeypot — harus kosong. Manusia tidak melihat field ini.
   * Sengaja tidak memakai nama umum seperti "website"/"url"/"company": autofill browser
   * mengisi field bernama begitu meski tersembunyi, sehingga pengunjung asli dianggap bot.
   */
  hpCheck: z.string().max(200),
});

export type DownloadFormData = z.infer<typeof downloadFormSchema>;

/** Payload lengkap yang dikirim ke POST /api/books/download */
export const downloadRequestSchema = downloadFormSchema.extend({
  slug: z.string().trim().min(1).max(200),
  turnstileToken: z.string().max(2048),
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;

export interface DownloadResponse {
  ok: boolean;
  /** true jika email yang sama sudah dikirim dalam 10 menit terakhir */
  alreadySent?: boolean;
  error?: string;
}
