"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import EditorialDialog from "@/components/editorial/EditorialDialog";
import { fraunces, inter } from "@/components/editorial/fonts";
import Turnstile, { type TurnstileHandle } from "@/components/ui/Turnstile";
import {
  TESTIMONIAL_MAX_CHARS,
  testimonialFormSchema,
  type TestimonialFormData,
  type TestimonialRequest,
} from "@/services/testimonials/testimonialSchema";

// Label terhubung ke input lewat htmlFor, pesan error lewat id `${id}-error` (dipakai aria-describedby)
function Field({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-[var(--ed-accent)]">
            *
          </span>
        )}
        {optional && <span className="ml-2 normal-case tracking-normal opacity-70">(opsional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-[var(--ed-accent)]">
          {error}
        </p>
      )}
    </div>
  );
}

const errorProps = (id: string, error?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});

const underlineInput =
  "w-full border-0 border-b border-[var(--ed-border)] bg-transparent px-0 py-2 text-sm text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)] focus:outline-none focus:border-[var(--ed-accent)] transition-colors rounded-none";

export default function CreateTestimonial() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = TESTIMONIAL_MAX_CHARS;
  const turnstileRef = useRef<TurnstileHandle>(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: { name: "", position: "", company: "", testimonial: "", linkedinUrl: "", hpCheck: "" },
  });

  // Kosongkan form lalu tutup popup — tanpa memuat ulang halaman
  const writeAgain = () => {
    reset();
    setCharCount(0);
    setSuccess(false);
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setLoading(true);
    setSubmitError(null);

    let turnstileToken: string;
    try {
      if (!turnstileRef.current) throw new Error("Turnstile belum siap");
      turnstileToken = await turnstileRef.current.getToken();
    } catch (error) {
      console.error("Turnstile:", error);
      turnstileRef.current?.reset();
      setSubmitError("Verifikasi keamanan belum berhasil. Muat ulang halaman, lalu coba lagi.");
      setLoading(false);
      return;
    }

    try {
      const payload: TestimonialRequest = { ...data, turnstileToken };
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
    } catch {
      setSuccess(false);
      setSubmitError("Testimoni gagal dikirim. Silakan coba lagi beberapa saat lagi.");
    } finally {
      // Token Turnstile hanya sekali pakai
      turnstileRef.current?.reset();
      setLoading(false);
    }
  };

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <div className="mx-auto w-full max-w-[920px] px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        {/* Ucapan terima kasih — popup bersama. Tombol X / Esc / klik di luar → kembali ke Home */}
        <EditorialDialog
          open={success}
          onClose={() => router.push("/")}
          title="Terima Kasih!"
          closeLabel="Tutup dan kembali ke beranda"
          actions={
            <EditorialButton type="button" variant="secondary" onClick={writeAgain}>
              Tulis Testimoni Lagi
            </EditorialButton>
          }
        >
          <p>Terima kasih sudah meluangkan waktu untuk memberikan testimoni. Masukan Anda sangat berarti dan akan sangat berguna bagi saya dalam terus berkembang dan memberikan yang terbaik.</p>
          <p className="ed-serif mt-5 text-lg italic text-[var(--ed-text-muted)]">Salam hangat, Faqih Nur Fahmi</p>
        </EditorialDialog>

        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ed-text-muted)]">Testimonial</p>
          <h1 className="ed-serif mt-3 text-3xl leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.2]">Tulis Testimoni</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-[var(--ed-text-secondary)]">
            Ceritakan bagaimana pengalaman Anda saat bekerja sama dengan Faqih Nur Fahmi.
          </p>
        </div>

        {/* Form — underline inputs */}
        <form onSubmit={(e) => handleSubmit(onSubmit)(e)} onFocus={() => turnstileRef.current?.prepare()} className="max-w-xl space-y-8" noValidate>
          {/* Name */}
          <Field id="name" label="Nama" required error={errors.name?.message}>
            <input id="name" autoComplete="name" aria-required="true" {...register("name")} {...errorProps("name", errors.name?.message)} className={underlineInput} placeholder="Nama lengkap Anda" />
          </Field>

          {/* Position & Company - 2 columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field id="position" label="Posisi" error={errors.position?.message}>
              <input id="position" autoComplete="organization-title" {...register("position")} {...errorProps("position", errors.position?.message)} className={underlineInput} placeholder="Supervisor HR, Manager IT, dll" />
            </Field>
            <Field id="company" label="Perusahaan" error={errors.company?.message}>
              <input id="company" autoComplete="organization" {...register("company")} {...errorProps("company", errors.company?.message)} className={underlineInput} placeholder="PT ABC Indonesia" />
            </Field>
          </div>

          {/* LinkedIn */}
          <Field id="linkedinUrl" label="LinkedIn" optional error={errors.linkedinUrl?.message}>
            <input id="linkedinUrl" type="url" {...register("linkedinUrl")} {...errorProps("linkedinUrl", errors.linkedinUrl?.message)} className={underlineInput} placeholder="https://linkedin.com/in/namaanda" />
          </Field>

          {/* Testimonial */}
          <Field id="testimonial" label="Testimoni" required error={errors.testimonial?.message}>
            <textarea
              id="testimonial"
              aria-required="true"
              {...errorProps("testimonial", errors.testimonial?.message)}
              {...register("testimonial", {
                onChange: (e) => setCharCount(e.target.value.length),
              })}
              rows={6}
              maxLength={MAX_CHARS}
              className={`${underlineInput} resize-none`}
              placeholder="Bagikan pengalaman Anda bekerja sama dengan Faqih..."
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span />
              <span className={`text-xs ${charCount >= MAX_CHARS ? "text-[var(--ed-accent)]" : "text-[var(--ed-text-muted)]"}`}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </Field>

          {/* Honeypot — tersembunyi dari pengunjung, hanya bot yang mengisinya */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="testimonial-hp">Jangan isi kolom ini</label>
            <input id="testimonial-hp" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" {...register("hpCheck")} />
          </div>

          {/* Turnstile — hanya terlihat bila Cloudflare butuh interaksi */}
          <Turnstile ref={turnstileRef} />

          {/* Pesan gagal kirim */}
          {submitError && (
            <p role="alert" className="text-sm text-[var(--ed-accent)]">
              {submitError}
            </p>
          )}

          {/* Submit */}
          <EditorialButton type="submit" disabled={loading} variant="primary">
            {loading ? "Mengirim..." : "Kirim Testimoni"}
          </EditorialButton>
        </form>
      </div>
    </div>
  );
}
