// ============================================================
// Nama properti Notion untuk fitur Buku
// Kalau nama properti di Notion diganti, cukup ubah di file ini.
// ============================================================

/** Database `Books` */
export const BOOK_PROPS = {
  title: "Judul",
  slug: "Slug",
  status: "Status",
  type: "Jenis",
  category: "Kategori",
  topics: "Topik",
  author: "Penulis",
  translator: "Penerjemah",
  originalTitle: "Judul Asli",
  originalLanguage: "Bahasa Asli",
  synopsis: "Sinopsis",
  pageCount: "Jumlah Halaman",
  fileSize: "Ukuran File",
  edition: "Edisi",
  publishedAt: "Tanggal Terbit",
  cover: "Cover",
  previews: "Pratinjau",
  price: "Harga",
  driveFileId: "Drive File ID",
} as const;

/** Database `Pembaca` */
export const READER_PROPS = {
  email: "Email",
  name: "Nama",
  book: "Buku",
  date: "Tanggal",
  consent: "Setuju Promosi",
} as const;

/** Nilai select `Status` — hanya `published` yang tampil di situs */
export const BOOK_STATUS = {
  draft: "Draft",
  published: "Published",
} as const;

/** Nilai select `Jenis` */
export const BOOK_TYPE = {
  translation: "Terjemahan",
  original: "Karya Sendiri",
} as const;

/** Judul Heading 2 yang membagi body halaman Notion menjadi beberapa bagian */
export const BOOK_SECTION_HEADINGS = {
  description: "Deskripsi",
  toc: "Daftar Isi",
  aboutAuthor: "Tentang Penulis",
  faq: "FAQ",
} as const;
