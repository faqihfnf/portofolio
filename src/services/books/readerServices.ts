import "server-only";

import { notion } from "@/lib/notion";
import { READER_PROPS } from "./properties";

// ============================================================
// Database `Pembaca` — catatan permintaan unduh
// ============================================================

const RESEND_WINDOW_MINUTES = 10;

function readersDatabaseId(): string {
  const id = process.env.NOTION_READERS_ID;
  if (!id) throw new Error("NOTION_READERS_ID belum diisi");
  return id;
}

/** Waktu sekarang dalam ISO 8601 dengan offset Asia/Jakarta (WIB, UTC+7, tanpa DST) */
function toJakartaIso(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return shifted.toISOString().replace("Z", "+07:00");
}

/** Apakah email ini sudah meminta buku yang sama dalam 10 menit terakhir? */
export async function hasRecentRequest(email: string, bookId: string): Promise<boolean> {
  const since = new Date(Date.now() - RESEND_WINDOW_MINUTES * 60 * 1000);

  const response = await notion.databases.query({
    database_id: readersDatabaseId(),
    page_size: 1,
    filter: {
      and: [
        { property: READER_PROPS.email, title: { equals: email } },
        { property: READER_PROPS.book, relation: { contains: bookId } },
        { property: READER_PROPS.date, date: { on_or_after: toJakartaIso(since) } },
      ],
    },
  });

  return response.results.length > 0;
}

interface SaveReaderInput {
  email: string;
  name?: string;
  bookId: string;
  consent: boolean;
}

export async function saveReader({ email, name, bookId, consent }: SaveReaderInput): Promise<void> {
  await notion.pages.create({
    parent: { database_id: readersDatabaseId() },
    properties: {
      [READER_PROPS.email]: { title: [{ text: { content: email } }] },
      [READER_PROPS.name]: { rich_text: name ? [{ text: { content: name } }] : [] },
      [READER_PROPS.book]: { relation: [{ id: bookId }] },
      [READER_PROPS.date]: { date: { start: toJakartaIso(new Date()) } },
      [READER_PROPS.consent]: { checkbox: consent },
    },
  });
}
