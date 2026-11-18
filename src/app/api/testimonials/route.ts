import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "@/lib/notion";
import { testimonialRequestSchema } from "@/services/testimonials/testimonialSchema";
import { verifyTurnstile } from "@/services/turnstile";

const DB_ID = process.env.NOTION_TESTIMONIALS_ID as string;

type Properties = PageObjectResponse["properties"];

const readText = (props: Properties, key: string): string => {
  const prop = props[key];
  if (prop?.type === "title") return prop.title[0]?.plain_text ?? "";
  if (prop?.type === "rich_text") return prop.rich_text[0]?.plain_text ?? "";
  return "";
};

// Di-cache 5 menit supaya setiap kunjungan Home tidak memicu query ke Notion. Aman di-cache karena
// testimoni hanya berisi teks — tidak ada URL file Notion yang kedaluwarsa. Error tidak ikut di-cache.
const getPublishedTestimonials = unstable_cache(
  async () => {
    const raw = await notion.databases.query({
      database_id: DB_ID,
      filter: {
        property: "Status",
        select: { equals: "Published" },
      },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    });

    return (raw.results as PageObjectResponse[]).map((page) => {
      const props = page.properties;
      const linkedin = props.LinkedInUrl;
      // Hanya tautan https yang ditampilkan, untuk data lama yang masuk sebelum ada validasi server
      const linkedinUrl = linkedin?.type === "url" && linkedin.url?.startsWith("https://") ? linkedin.url : null;

      return {
        id: page.id,
        name: readText(props, "Name"),
        position: readText(props, "Position"),
        company: readText(props, "Company"),
        testimonial: readText(props, "Testimonial"),
        linkedinUrl,
      };
    });
  },
  ["published-testimonials"],
  { revalidate: 300 },
);

// GET — fetch published testimonials
export async function GET() {
  try {
    return NextResponse.json(await getPublishedTestimonials());
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST — create new testimonial (status: Draft)
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  // Honeypot terisi → bot. Balas sukses palsu tanpa menyimpan apa pun.
  const honeypot = (body as { hpCheck?: unknown } | null)?.hpCheck;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.warn("[testimonials] Honeypot terisi, permintaan diabaikan (dianggap bot)");
    return NextResponse.json({ success: true });
  }

  const parsed = testimonialRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data testimoni belum lengkap atau tidak valid." }, { status: 400 });
  }
  const { name, position, company, testimonial, linkedinUrl, turnstileToken } = parsed.data;

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const human = turnstileToken ? await verifyTurnstile(turnstileToken, ip) : false;
    if (!human) {
      return NextResponse.json({ error: "Verifikasi keamanan gagal. Muat ulang halaman, lalu coba lagi." }, { status: 403 });
    }
  } catch (error) {
    console.error("[testimonials] Verifikasi Turnstile gagal:", error);
    return NextResponse.json({ error: "Testimoni gagal dikirim." }, { status: 500 });
  }

  try {
    await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Position: { rich_text: [{ text: { content: position } }] },
        Company: { rich_text: [{ text: { content: company } }] },
        Testimonial: { rich_text: [{ text: { content: testimonial } }] },
        Status: { select: { name: "Draft" } },
        // Kolom LinkedInUrl hanya diisi bila ada, supaya database tanpa kolom itu tetap bisa menerima testimoni
        ...(linkedinUrl ? { LinkedInUrl: { url: linkedinUrl } } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json({ error: "Testimoni gagal dikirim." }, { status: 500 });
  }
}
