import "server-only";

import { Resend } from "resend";
import { AUTHOR_NAME, BOOKS_URL, SHARING_PERMISSION } from "@/data/books";

// ============================================================
// Email pengiriman ebook (Resend)
// ============================================================

const DEFAULT_FROM = `${AUTHOR_NAME} <buku@faqih.id>`;

// Warna mengikuti token editorial (mode terang) — klien email tidak mendukung CSS variable
const COLOR = {
  bg: "#f4f3ef",
  card: "#ffffff",
  text: "#1b1c1e",
  secondary: "#4a4a46",
  muted: "#6b6960",
  border: "#d8d6ce",
  accent: "#7d6439",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

interface BookEmailContent {
  name?: string;
  title: string;
}

function renderHtml({ name, title }: BookEmailContent): string {
  const greeting = name ? `Halo ${escapeHtml(name)},` : "Halo,";
  const safeTitle = escapeHtml(title);

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ebook: ${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${COLOR.bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.bg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${COLOR.card};border:1px solid ${COLOR.border};">
            <tr>
              <td style="padding:36px 36px 0 36px;">
                <p style="margin:0;border-left:2px solid ${COLOR.accent};padding-left:12px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLOR.muted};">Ebook Anda</p>
                <h1 style="margin:20px 0 0 0;font-family:${SERIF};font-size:26px;line-height:1.25;font-weight:normal;color:${COLOR.text};">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 0 36px;font-family:${SANS};font-size:15px;line-height:1.7;color:${COLOR.secondary};">
                <p style="margin:0 0 16px 0;">${greeting}</p>
                <p style="margin:0 0 16px 0;">Terima kasih sudah meminta ebook <strong style="color:${COLOR.text};">${safeTitle}</strong>. File PDF-nya terlampir di email ini. Semoga bermanfaat.</p>
                <p style="margin:0 0 16px 0;">${escapeHtml(SHARING_PERMISSION)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 36px 36px 36px;font-family:${SANS};font-size:15px;line-height:1.7;">
                <a href="${BOOKS_URL}" style="color:${COLOR.accent};text-decoration:underline;">Lihat buku lainnya di faqih.id/books</a>
                <p style="margin:28px 0 0 0;font-family:${SERIF};font-style:italic;font-size:16px;color:${COLOR.text};">${escapeHtml(AUTHOR_NAME)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px;border-top:1px solid ${COLOR.border};font-family:${SANS};font-size:12px;line-height:1.6;color:${COLOR.muted};">
                Anda menerima email ini karena meminta ebook di faqih.id. Jika Anda tidak merasa memintanya, abaikan saja email ini.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ name, title }: BookEmailContent): string {
  return [
    name ? `Halo ${name},` : "Halo,",
    "",
    `Terima kasih sudah meminta ebook "${title}". File PDF-nya terlampir di email ini. Semoga bermanfaat.`,
    "",
    SHARING_PERMISSION,
    "",
    `Buku lainnya: ${BOOKS_URL}`,
    "",
    AUTHOR_NAME,
    "",
    "--",
    "Anda menerima email ini karena meminta ebook di faqih.id. Jika Anda tidak merasa memintanya, abaikan saja email ini.",
  ].join("\n");
}

interface SendBookEmailInput extends BookEmailContent {
  to: string;
  slug: string;
  pdf: Buffer;
}

/** Kirim ebook sebagai lampiran PDF. Melempar error jika Resend menolak. */
export async function sendBookEmail({ to, name, title, slug, pdf }: SendBookEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY belum diisi");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.BOOKS_EMAIL_FROM || DEFAULT_FROM,
    to,
    subject: `Ebook: ${title}`,
    html: renderHtml({ name, title }),
    text: renderText({ name, title }),
    attachments: [{ filename: `${slug}.pdf`, content: pdf }],
  });

  // SDK Resend tidak melempar error — kegagalan dikembalikan lewat field `error`
  if (error) throw new Error(`Resend gagal mengirim email: ${error.name} — ${error.message}`);
}
