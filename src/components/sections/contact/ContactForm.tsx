"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { motion } from "motion/react";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import EditorialDialog from "@/components/editorial/EditorialDialog";
import { useTranslation } from "react-i18next";

// Pesan error berupa key terjemahan, diterjemahkan saat ditampilkan supaya ikut bahasa yang dipilih
const contactSchema = z.object({
  name: z.string().min(2, "contact.errors.name-min"),
  email: z.string().email("contact.errors.email-invalid"),
  subject: z.string().min(5, "contact.errors.subject-min"),
  message: z.string().min(10, "contact.errors.message-min"),
});
type ContactFormData = z.infer<typeof contactSchema>;

// Label terhubung ke input lewat htmlFor, pesan error lewat id `${id}-error` (dipakai aria-describedby)
function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">
        {label}
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
  "w-full border-0 border-b border-[var(--ed-border)] bg-transparent px-0 py-2 text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)] focus:outline-none focus:border-[var(--ed-accent)] transition-colors rounded-none";

export function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [sendError, setSendError] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const { t } = useTranslation();

  const onSubmit = async (data: ContactFormData) => {
    setIsSending(true);
    setSendError(false);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          user_name: data.name,
          user_email: data.email,
          subject: data.subject,
          message: data.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setSenderName(data.name.split(" ")[0]);
      reset();
      setShowSuccess(true);
    } catch (err) {
      const detail = (err as { text?: string })?.text ?? (err as Error)?.message ?? "Unknown error";
      console.error("EmailJS error:", detail, err);
      setSendError(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <h2 className="ed-serif text-2xl tracking-tight">{t("contact.form-title")}</h2>
      <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <Field id="name" label={t("contact.name")} error={errors.name?.message && t(errors.name.message)}>
          <input id="name" autoComplete="name" {...register("name")} {...errorProps("name", errors.name?.message)} className={underlineInput} placeholder={t("contact.name-placeholder")} />
        </Field>
        {/* Email */}
        <Field id="email" label={t("contact.email")} error={errors.email?.message && t(errors.email.message)}>
          <input id="email" type="email" autoComplete="email" {...register("email")} {...errorProps("email", errors.email?.message)} className={underlineInput} placeholder={t("contact.email-placeholder")} />
        </Field>
        {/* Subject */}
        <Field id="subject" label={t("contact.subject")} error={errors.subject?.message && t(errors.subject.message)}>
          <input id="subject" {...register("subject")} {...errorProps("subject", errors.subject?.message)} className={underlineInput} placeholder={t("contact.subject-placeholder")} />
        </Field>
        {/* Message */}
        <Field id="message" label={t("contact.message")} error={errors.message?.message && t(errors.message.message)}>
          <textarea id="message" rows={5} {...register("message")} {...errorProps("message", errors.message?.message)} className={`${underlineInput} resize-none`} placeholder={t("contact.message-placeholder")} />
        </Field>

        {/* Pesan gagal kirim — sebelumnya memakai alert() berbahasa Inggris */}
        {sendError && (
          <p role="alert" className="text-sm text-[var(--ed-accent)]">
            {t("contact.send-error")}
          </p>
        )}

        {/* Submit — button dengan border tipis */}
        <EditorialButton type="submit" disabled={isSending} variant="primary">
          {isSending ? t("contact.sending") : t("contact.send")}
        </EditorialButton>
      </form>

      {/* Popup terima kasih — komponen popup bersama (sama dengan unduh ebook & testimoni) */}
      <EditorialDialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={t("contact.success-title")}
        closeLabel={t("contact.success-close")}
        actions={
          <EditorialButton variant="secondary" onClick={() => setShowSuccess(false)}>
            {t("contact.success-close")}
          </EditorialButton>
        }
      >
        <p>
          {senderName ? `${senderName}, ` : ""}
          {t("contact.success-body")}
        </p>
      </EditorialDialog>
    </motion.div>
  );
}
