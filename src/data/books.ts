// ============================================================
// Konten halaman Buku yang disimpan di kode (bukan di Notion)
// ============================================================

export const AUTHOR_NAME = "Faqih Nur Fahmi";

export const BOOKS_URL = "https://faqih.id/books";

/** FAQ umum — berlaku untuk semua buku, tampil setelah FAQ khusus dari Notion */
export const GENERAL_FAQ: { question: string; answer: string }[] = [
  {
    question: "Apakah ebook ini benar-benar gratis?",
    answer: "Ya, gratis sepenuhnya. Cukup masukkan email, dan file PDF akan dikirim ke inbox Anda.",
  },
  {
    question: "Email belum masuk, bagaimana?",
    answer: "Tunggu beberapa menit, lalu periksa folder Spam atau Promosi. Jika tetap tidak ada, coba kirim ulang melalui form.",
  },
  {
    question: "Bolehkah ebook ini disebarkan atau dicetak?",
    answer: "Boleh, untuk keperluan non-komersial dan tanpa mengubah isi.",
  },
  {
    question: "Bagaimana jika saya menemukan salah ketik atau kekeliruan?",
    answer: "Silakan hubungi saya melalui halaman Kontak. Masukan Anda sangat berarti untuk edisi berikutnya.",
  },
  {
    question: "Apakah email saya akan disebarkan?",
    answer: "Tidak. Email hanya dipakai untuk mengirim ebook dan, jika Anda menyetujuinya, kabar buku baru.",
  },
];

// Bio penulis. Selama masih diawali "TODO", bio tidak ditampilkan di situs.
/** Versi lengkap — untuk buku Karya Sendiri */
export const AUTHOR_BIO_FULL = "TODO: bio penulis (versi lengkap, untuk buku karya sendiri)";

/** Versi singkat 1–2 kalimat — sebagai penerjemah di buku Terjemahan */
export const AUTHOR_BIO_SHORT = "TODO: bio singkat penerjemah (1–2 kalimat)";

export const isPlaceholder = (text: string) => text.trim() === "" || text.trim().toUpperCase().startsWith("TODO");

/** Kalimat izin penyebaran — tampil kecil di bawah form unduh dan di email */
export const SHARING_PERMISSION = "Ebook ini boleh disebarkan untuk keperluan non-komersial tanpa mengubah isinya.";

/** Teks kecil di bawah form unduh */
export const PRIVACY_NOTE = "Email Anda hanya dipakai untuk mengirim ebook, dan tidak dibagikan ke pihak lain.";

export const CONSENT_LABEL = `Saya bersedia menerima kabar buku baru dari ${AUTHOR_NAME}.`;
