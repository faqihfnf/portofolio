import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

// ============================================================
// Tipe dan helper block Notion yang aman dipakai di client maupun server.
// Sengaja terpisah dari services/notionServices.ts supaya komponen client
// tidak ikut membawa Notion SDK dan kode server ke bundle browser.
// ============================================================

/** Block Notion lengkap, ditambah anak-anaknya yang sudah diambil secara rekursif */
export type NotionBlock = BlockObjectResponse & { children?: NotionBlock[] };

/** Rich text dari block yang berisi teks; block lain menghasilkan array kosong */
export function blockRichText(block: NotionBlock): RichTextItemResponse[] {
  switch (block.type) {
    case "paragraph":
      return block.paragraph.rich_text;
    case "heading_1":
      return block.heading_1.rich_text;
    case "heading_2":
      return block.heading_2.rich_text;
    case "heading_3":
      return block.heading_3.rich_text;
    case "bulleted_list_item":
      return block.bulleted_list_item.rich_text;
    case "numbered_list_item":
      return block.numbered_list_item.rich_text;
    case "quote":
      return block.quote.rich_text;
    case "toggle":
      return block.toggle.rich_text;
    case "callout":
      return block.callout.rich_text;
    case "to_do":
      return block.to_do.rich_text;
    default:
      return [];
  }
}

/** Gabungan plain text dari rich text */
export const plainTextOf = (richText: RichTextItemResponse[]): string => richText.map((t) => t.plain_text).join("");
