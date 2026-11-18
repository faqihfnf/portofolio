import { z } from "zod";

// ============================================================
// Skema form testimoni — dipakai bersama oleh form (client) dan route handler (server)
// ============================================================

export const TESTIMONIAL_MAX_CHARS = 250;

const isLinkedInUrl = (value: string) => {
  try {
    const { protocol, hostname } = new URL(value);
    return protocol === "https:" && (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com"));
  } catch {
    return false;
  }
};

/** Field yang diisi pengunjung */
export const testimonialFormSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  position: z.string().trim().max(100, "Posisi terlalu panjang"),
  company: z.string().trim().max(100, "Nama perusahaan terlalu panjang"),
  testimonial: z
    .string()
    .trim()
    .min(25, "Testimoni minimal 25 karakter")
    .max(TESTIMONIAL_MAX_CHARS, `Testimoni maksimal ${TESTIMONIAL_MAX_CHARS} karakter`),
  linkedinUrl: z
    .string()
    .trim()
    .max(300, "URL terlalu panjang")
    .refine((value) => value === "" || isLinkedInUrl(value), "Masukkan URL profil LinkedIn, contoh https://linkedin.com/in/namaanda"),
  /** Honeypot — harus kosong. Lihat catatan penamaan di downloadSchema.ts. */
  hpCheck: z.string().max(200),
});

export type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

/** Payload lengkap yang dikirim ke POST /api/testimonials */
export const testimonialRequestSchema = testimonialFormSchema.extend({
  turnstileToken: z.string().max(2048),
});

export type TestimonialRequest = z.infer<typeof testimonialRequestSchema>;
