import "server-only";

import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "@/lib/notion";
import { blockRichText, plainTextOf, type NotionBlock } from "@/lib/notionBlocks";
import { getCache, getPageBlocks, setCache } from "@/services/notionServices";
import { mirrorNotionUrl, mirrorNotionUrls } from "@/services/notionImageMirror";
import { BOOK_PROPS, BOOK_SECTION_HEADINGS, BOOK_STATUS, BOOK_TYPE } from "./properties";
import type { Book, BookFaqItem, BookImage, BookSections } from "./types";

// ============================================================
// Tipe internal — HANYA untuk server
// Drive File ID tidak boleh sampai ke browser (props, payload RSC, maupun respons API).
// ============================================================
export interface InternalBook extends Book {
  driveFileId: string | null;
}

type PageProperty = PageObjectResponse["properties"][string];

// ============================================================
// Pembaca properti Notion
// ============================================================
function readText(prop: PageProperty | undefined): string | null {
  if (!prop) return null;
  const parts = prop.type === "title" ? prop.title : prop.type === "rich_text" ? prop.rich_text : [];
  const value = parts
    .map((t) => t.plain_text)
    .join("")
    .trim();
  return value || null;
}

function readSelect(prop: PageProperty | undefined): string | null {
  return prop?.type === "select" ? (prop.select?.name ?? null) : null;
}

function readMultiSelect(prop: PageProperty | undefined): string[] {
  return prop?.type === "multi_select" ? prop.multi_select.map((item) => item.name) : [];
}

function readNumber(prop: PageProperty | undefined): number | null {
  return prop?.type === "number" ? prop.number : null;
}

function readDate(prop: PageProperty | undefined): string | null {
  return prop?.type === "date" ? (prop.date?.start ?? null) : null;
}

function readFiles(prop: PageProperty | undefined): BookImage[] {
  if (prop?.type !== "files") return [];
  return prop.files.flatMap((file) => {
    const url = file.type === "external" ? file.external.url : file.type === "file" ? file.file.url : null;
    return url ? [{ url, name: file.name }] : [];
  });
}

function mapBook(page: PageObjectResponse): InternalBook | null {
  const props = page.properties;
  const slug = readText(props[BOOK_PROPS.slug]);
  // Tanpa slug buku tidak punya URL, jadi tidak bisa ditampilkan
  if (!slug) return null;

  return {
    id: page.id,
    title: readText(props[BOOK_PROPS.title]) ?? "Tanpa Judul",
    slug,
    type: readSelect(props[BOOK_PROPS.type]) === BOOK_TYPE.translation ? "translation" : "original",
    category: readSelect(props[BOOK_PROPS.category]),
    topics: readMultiSelect(props[BOOK_PROPS.topics]),
    author: readText(props[BOOK_PROPS.author]),
    translator: readText(props[BOOK_PROPS.translator]),
    originalTitle: readText(props[BOOK_PROPS.originalTitle]),
    originalLanguage: readSelect(props[BOOK_PROPS.originalLanguage]),
    synopsis: readText(props[BOOK_PROPS.synopsis]) ?? "",
    pageCount: readNumber(props[BOOK_PROPS.pageCount]),
    fileSize: readText(props[BOOK_PROPS.fileSize]),
    edition: readText(props[BOOK_PROPS.edition]),
    publishedAt: readDate(props[BOOK_PROPS.publishedAt]),
    cover: readFiles(props[BOOK_PROPS.cover])[0]?.url ?? null,
    previews: readFiles(props[BOOK_PROPS.previews]),
    price: readNumber(props[BOOK_PROPS.price]) ?? 0,
    driveFileId: readText(props[BOOK_PROPS.driveFileId]),
  };
}

// Field disalin satu per satu (bukan spread) supaya field internal baru tidak ikut bocor ke browser
function toPublicBook(book: InternalBook): Book {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    type: book.type,
    category: book.category,
    topics: book.topics,
    author: book.author,
    translator: book.translator,
    originalTitle: book.originalTitle,
    originalLanguage: book.originalLanguage,
    synopsis: book.synopsis,
    pageCount: book.pageCount,
    fileSize: book.fileSize,
    edition: book.edition,
    publishedAt: book.publishedAt,
    cover: book.cover,
    previews: book.previews,
    price: book.price,
  };
}

// ============================================================
// getInternalBooks — semua buku Published, termasuk Drive File ID
// Cache in-memory 30 menit mengikuti blog. URL file Notion kedaluwarsa ±1 jam,
// jadi URL cover/pratinjau yang tersaji selalu masih berlaku minimal 30 menit.
// ============================================================
async function getInternalBooks(): Promise<InternalBook[]> {
  const cacheKey = "books-list";
  const cached = getCache<InternalBook[]>(cacheKey);
  if (cached) return cached;

  const databaseId = process.env.NOTION_BOOKS_ID;
  if (!databaseId) {
    console.warn("NOTION_BOOKS_ID belum diisi — halaman buku ditampilkan kosong.");
    return [];
  }

  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: BOOK_PROPS.status,
        select: { equals: BOOK_STATUS.published },
      },
      sorts: [{ property: BOOK_PROPS.publishedAt, direction: "descending" }],
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    pages.push(...(response.results as PageObjectResponse[]));
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  const books = pages.flatMap((page) => mapBook(page) ?? []);

  // Terbaru di atas; buku tanpa Tanggal Terbit di paling bawah
  const time = (book: InternalBook) => (book.publishedAt ? new Date(book.publishedAt).getTime() : 0);
  books.sort((a, b) => time(b) - time(a));

  // Cover dan pratinjau unggahan Notion → CDN R2 bila sudah tersalin
  await Promise.all(
    books.map(async (book) => {
      book.cover = book.cover ? await mirrorNotionUrl(book.cover) : null;
      const urls = await mirrorNotionUrls(book.previews.map((preview) => preview.url));
      book.previews = book.previews.map((preview, i) => ({ ...preview, url: urls[i] }));
    }),
  );

  setCache(cacheKey, books);
  return books;
}

/** Daftar buku Published untuk ditampilkan (tanpa Drive File ID) */
export async function getBooks(): Promise<Book[]> {
  const books = await getInternalBooks();
  return books.map(toPublicBook);
}

/** Buku lengkap dengan Drive File ID — hanya untuk route handler unduhan */
export async function getInternalBookBySlug(slug: string): Promise<InternalBook | null> {
  const books = await getInternalBooks();
  return books.find((book) => book.slug === slug) ?? null;
}

// ============================================================
// getBookSections — pecah body halaman Notion berdasarkan Heading 2
// ============================================================
type SectionKey = keyof typeof BOOK_SECTION_HEADINGS;

const plainText = (block: NotionBlock): string => plainTextOf(blockRichText(block)).trim();

const isEmptyParagraph = (block: NotionBlock) => block.type === "paragraph" && plainText(block) === "" && !block.children?.length;

// Buang paragraf kosong di awal dan akhir, supaya bagian yang isinya cuma baris kosong dianggap tidak ada
function trimEmpty(blocks: NotionBlock[]): NotionBlock[] {
  let start = 0;
  let end = blocks.length;
  while (start < end && isEmptyParagraph(blocks[start])) start++;
  while (end > start && isEmptyParagraph(blocks[end - 1])) end--;
  return blocks.slice(start, end);
}

function matchSection(block: NotionBlock): SectionKey | null {
  if (block.type !== "heading_2") return null;
  const title = plainText(block).toLowerCase();
  const match = (Object.keys(BOOK_SECTION_HEADINGS) as SectionKey[]).find((key) => BOOK_SECTION_HEADINGS[key].toLowerCase() === title);
  return match ?? null;
}

export async function getBookSections(pageId: string): Promise<BookSections> {
  const blocks = await getPageBlocks(pageId);

  const buckets: Record<SectionKey, NotionBlock[]> = { description: [], toc: [], aboutAuthor: [], faq: [] };
  // Teks sebelum Heading 2 pertama dianggap bagian dari Deskripsi
  let current: SectionKey = "description";

  for (const block of blocks) {
    const section = matchSection(block);
    if (section) {
      current = section;
      // Heading 2 yang dibuat sebagai toggle menyimpan isinya sebagai children
      if (block.children?.length) buckets[current].push(...block.children);
      continue;
    }
    buckets[current].push(block);
  }

  const faq: BookFaqItem[] = buckets.faq
    .filter((block) => block.type === "toggle")
    .map((block) => ({ id: block.id, question: plainText(block), answer: trimEmpty(block.children ?? []) }))
    .filter((item) => item.question && item.answer.length > 0);

  return {
    description: trimEmpty(buckets.description),
    toc: trimEmpty(buckets.toc),
    aboutAuthor: trimEmpty(buckets.aboutAuthor),
    faq,
  };
}
