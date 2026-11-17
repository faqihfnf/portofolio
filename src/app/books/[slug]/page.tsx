import { ReactNode } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import { fraunces, inter } from "@/components/editorial/fonts";
import NotionBlockRenderer from "@/components/sections/blog/NotionBlockRenderer";
import Accordion, { type AccordionItem } from "@/components/sections/books/Accordion";
import { amiri } from "@/components/sections/books/arabicFont";
import BookCard from "@/components/sections/books/BookCard";
import DownloadForm from "@/components/sections/books/DownloadForm";
import MobileDownloadBar from "@/components/sections/books/MobileDownloadBar";
import PreviewGallery from "@/components/sections/books/PreviewGallery";
import { AUTHOR_BIO_FULL, AUTHOR_BIO_SHORT, AUTHOR_NAME, BOOKS_URL, GENERAL_FAQ, isPlaceholder } from "@/data/books";
import { categorySlug, getAuthorLine, getTranslatorName, hasArabicScript, isSamePerson, pickOtherBooks } from "@/lib/books";
import { getBooks, getBookSections } from "@/services/books/bookServices";

// Mengikuti pola blog: render dinamis + cache in-memory 30 menit di service
export const dynamic = "force-dynamic";

const BOTTOM_FORM_ID = "unduh";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const books = await getBooks();
  const book = books.find((b) => b.slug === slug);

  // Slug tidak dikenal atau masih Draft → 404
  if (!book) notFound();

  const description = book.synopsis || `Unduh gratis ebook ${book.title}. ${getAuthorLine(book)}.`;

  return {
    // Suffix "| Faqih Nur Fahmi" sudah ditambahkan oleh title.template di root layout
    title: book.title,
    description,
    alternates: { canonical: `/books/${slug}` },
    openGraph: {
      title: book.title,
      description,
      type: "book",
      url: `${BOOKS_URL}/${slug}`,
      // og:image diisi otomatis oleh ./opengraph-image.tsx (cover Notion di-proxy ke URL permanen)
      siteName: AUTHOR_NAME,
      locale: "id_ID",
      releaseDate: book.publishedAt || undefined,
      tags: book.topics.length > 0 ? book.topics : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
    },
  };
}

// Pola dua kolom editorial: label bagian di kiri, isi di kanan. Lebar kolom kiri sama dengan cover di hero.
const TWO_COLUMN = "grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:gap-14";
const SECTION_LABEL = "border-l-2 border-[var(--ed-accent)] pl-3 text-[11px] uppercase leading-relaxed tracking-[0.22em] text-[var(--ed-text-muted)]";

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={`mt-14 scroll-mt-24 border-t border-[var(--ed-border)] pt-10 md:mt-20 md:pt-14 ${TWO_COLUMN}`}>
      <div>
        <h2 className={SECTION_LABEL}>{title}</h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function BioText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .filter((paragraph) => paragraph.trim())
        .map((paragraph, i) => (
          <p key={i} className="my-3 leading-relaxed text-[var(--ed-text-secondary)]">
            {paragraph}
          </p>
        ))}
    </>
  );
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const books = await getBooks();
  const book = books.find((b) => b.slug === slug);
  // Slug tidak dikenal atau masih Draft → status 404 asli, bukan 200 (soft 404)
  if (!book) notFound();

  const sections = await getBookSections(book.id);
  const isTranslation = book.type === "translation";

  // Judul asli hanya untuk buku terjemahan
  const originalTitle = isTranslation ? book.originalTitle : null;

  // Chip info — hanya yang terisi
  const infoChips = [book.pageCount ? `${book.pageCount} halaman` : null, book.fileSize, "PDF", book.edition].filter((chip): chip is string => Boolean(chip));

  // Tentang Penulis (& Penerjemah)
  const notionAbout = sections.aboutAuthor.length > 0;
  // Bio dari kode hanya dipakai kalau orangnya memang pemilik situs dan bio-nya sudah diisi
  const translatorBio = isTranslation && isSamePerson(book.translator) && !isPlaceholder(AUTHOR_BIO_SHORT) ? AUTHOR_BIO_SHORT : null;
  const ownBio = !isTranslation && !notionAbout && isSamePerson(book.author) && !isPlaceholder(AUTHOR_BIO_FULL) ? AUTHOR_BIO_FULL : null;
  const showAbout = notionAbout || Boolean(translatorBio) || Boolean(ownBio);
  const aboutTitle = !isTranslation || !translatorBio ? "Tentang Penulis" : notionAbout ? "Tentang Penulis & Penerjemah" : "Tentang Penerjemah";

  // FAQ khusus buku (Notion) dulu, lalu FAQ umum (kode) — dalam satu accordion
  const faqItems: AccordionItem[] = [
    ...sections.faq.map((item) => ({ id: item.id, title: item.question, content: <NotionBlockRenderer blocks={item.answer} /> })),
    ...GENERAL_FAQ.map((item, i) => ({ id: `umum-${i}`, title: item.question, content: <p>{item.answer}</p> })),
  ];

  const otherBooks = pickOtherBooks(book, books);

  const pageUrl = `${BOOKS_URL}/${book.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${book.title} — ebook gratis: ${pageUrl}`)}`;

  return (
    <div lang="id" className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <article className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <Link href="/books" className="ed-link inline-block text-[11px] uppercase tracking-[0.18em]">
          <ArrowLeft className="mr-1 inline-block size-4" />
          Buku
        </Link>

        {/* 1. Hero — cover di kiri, informasi buku + form unduh di kanan */}
        <header className={`mt-8 ${TWO_COLUMN}`}>
          <div className="mx-auto w-full max-w-[220px] md:mx-0 md:max-w-none">
            {book.cover ? (
              <img src={book.cover} alt={`Sampul ${book.title}`} className="w-full rounded-[2px] border border-[var(--ed-border)]" />
            ) : (
              <div className="flex aspect-[5/7] items-center justify-center rounded-[2px] border border-[var(--ed-border)] bg-[var(--ed-bg-elevated)] p-6">
                <span className="ed-serif text-center text-xl italic leading-snug text-[var(--ed-text-muted)]">{book.title}</span>
              </div>
            )}
          </div>

          <div data-no-justify className="min-w-0">
            {(book.category || book.topics.length > 0) && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">
                {book.category && (
                  <Link href={`/books?kategori=${categorySlug(book.category)}`} className="text-[var(--ed-accent)] transition-opacity hover:opacity-70">
                    {book.category}
                  </Link>
                )}
                {book.topics.map((topic) => (
                  <span key={topic}>
                    <span aria-hidden="true" className="mr-3 text-[var(--ed-border)]">
                      /
                    </span>
                    {topic}
                  </span>
                ))}
              </p>
            )}

            <h1 className="ed-serif mt-4 text-3xl leading-tight tracking-tight md:text-[2.75rem] md:leading-[1.15]">{book.title}</h1>

            {originalTitle &&
              (hasArabicScript(originalTitle) ? (
                <p lang="ar" dir="rtl" className={`${amiri.className} mt-3 w-fit max-w-full text-2xl leading-relaxed text-[var(--ed-text-secondary)] md:text-[1.75rem]`}>
                  {originalTitle}
                </p>
              ) : (
                <p className="ed-serif mt-3 text-lg italic text-[var(--ed-text-secondary)]">{originalTitle}</p>
              ))}

            <p className="ed-serif mt-4 text-lg italic leading-relaxed text-[var(--ed-text-secondary)]">{getAuthorLine(book)}</p>

            {book.synopsis && <p className="mt-6 max-w-xl leading-relaxed text-[var(--ed-text-secondary)]">{book.synopsis}</p>}

            <ul className="mt-6 flex flex-wrap gap-2">
              {infoChips.map((chip) => (
                <li key={chip} className="rounded-[2px] border border-[var(--ed-border)] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ed-text-secondary)]">
                  {chip}
                </li>
              ))}
            </ul>

            {/* Di mobile form diganti tombol sticky + bottom sheet (MobileDownloadBar) */}
            <div className="mt-9 hidden border-t border-[var(--ed-border)] pt-8 md:block">
              <DownloadForm slug={book.slug} />
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="ed-link mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] underline">
              <Share2 size={14} strokeWidth={1.5} aria-hidden="true" />
              Bagikan ke WhatsApp
            </a>
          </div>
        </header>

        {/* 2. Deskripsi */}
        {sections.description.length > 0 && (
          <Section title="Deskripsi">
            <div className="[&>*:first-child]:mt-0">
              <NotionBlockRenderer blocks={sections.description} />
            </div>
          </Section>
        )}

        {/* 3. Daftar Isi — accordion buka-tutup */}
        {sections.toc.length > 0 && (
          <Section title="Daftar Isi">
            <Accordion
              items={[
                {
                  id: "daftar-isi",
                  title: "Lihat daftar isi",
                  content: (
                    <div data-no-justify>
                      <NotionBlockRenderer blocks={sections.toc} />
                    </div>
                  ),
                },
              ]}
            />
          </Section>
        )}

        {/* 4. Pratinjau Halaman */}
        {book.previews.length > 0 && (
          <Section title="Pratinjau Halaman">
            <PreviewGallery images={book.previews} title={book.title} />
          </Section>
        )}

        {/* 5. Tentang Penulis (& Penerjemah) */}
        {showAbout && (
          <Section title={aboutTitle}>
            <div className="[&>*:first-child]:mt-0">
              {/* Bagian "Tentang Penulis" dari Notion selalu didahulukan daripada bio dari kode */}
              {notionAbout && <NotionBlockRenderer blocks={sections.aboutAuthor} />}
              {ownBio && <BioText text={ownBio} />}
            </div>

            {translatorBio && (
              <div className={notionAbout ? "mt-8 border-t border-[var(--ed-border)] pt-8" : ""}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ed-text-muted)]">Penerjemah</p>
                <p className="ed-serif mt-2 text-xl tracking-tight">{getTranslatorName(book)}</p>
                <BioText text={translatorBio} />
              </div>
            )}
          </Section>
        )}

        {/* 6. FAQ */}
        <Section title="FAQ">
          <Accordion items={faqItems} />
        </Section>

        {/* 7. Form unduh sekali lagi */}
        <Section id={BOTTOM_FORM_ID} title="Unduh">
          <p className="ed-serif text-2xl leading-snug tracking-tight md:text-3xl">
            Dapatkan ebook ini, <span className="ed-accent-em">gratis</span>.
          </p>
          <p data-no-justify className="mt-3 max-w-xl leading-relaxed text-[var(--ed-text-secondary)]">
            Masukkan email Anda, dan <span className="text-[var(--ed-text)]">{book.title}</span> dikirim ke inbox sebagai lampiran PDF.
          </p>
          <DownloadForm slug={book.slug} className="mt-8" />
        </Section>

        {/* 8. Buku Lainnya */}
        {otherBooks.length > 0 && (
          <section className="mt-14 border-t border-[var(--ed-border)] pt-10 md:mt-20 md:pt-14">
            <h2 className={`${SECTION_LABEL} w-fit`}>Buku Lainnya</h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
              {otherBooks.map((other) => (
                <li key={other.id}>
                  <BookCard book={other} headingAs="h3" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <MobileDownloadBar slug={book.slug} title={book.title} hideAtId={BOTTOM_FORM_ID} />
    </div>
  );
}
