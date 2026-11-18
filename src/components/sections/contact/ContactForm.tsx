"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import { EditorialButton } from "@/components/editorial/EditorialButton";
import EditorialDialog from "@/components/editorial/EditorialDialog";
import { useTranslation } from "react-i18next";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
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
      alert(`Failed to send message (${detail}). Please try again or email me directly.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <h2 className="ed-serif text-2xl tracking-tight">Send Message</h2>
      <form className="mt-8 space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name */}
        <Field id="name" label="Name" error={errors.name?.message}>
          <input id="name" autoComplete="name" {...register("name")} {...errorProps("name", errors.name?.message)} className={underlineInput} placeholder="Your name" />
        </Field>
        {/* Email */}
        <Field id="email" label="Email" error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" {...register("email")} {...errorProps("email", errors.email?.message)} className={underlineInput} placeholder="your.email@example.com" />
        </Field>
        {/* Subject */}
        <Field id="subject" label="Subject" error={errors.subject?.message}>
          <input id="subject" {...register("subject")} {...errorProps("subject", errors.subject?.message)} className={underlineInput} placeholder="What's this about?" />
        </Field>
        {/* Message */}
        <Field id="message" label="Message" error={errors.message?.message}>
          <textarea id="message" rows={5} {...register("message")} {...errorProps("message", errors.message?.message)} className={`${underlineInput} resize-none`} placeholder="Your message..." />
        </Field>

        {/* Submit — button dengan border tipis */}
        <EditorialButton type="submit" disabled={isSending} variant="primary">
          {isSending ? "Sending..." : "Send Message"}
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
