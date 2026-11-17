# Fitur Baru: Halaman Ebook di faqih.id/books

## Konteks

Saya ingin memindahkan halaman ebook saya dari `marifah.id/ebook` (yang selama ini hanya menampilkan daftar buku, sedangkan unduhannya lewat clicky.id dan Google Drive) ke **`faqih.id/books`** di project ini.

Prinsipnya:

- **Semua buku gratis** untuk tahap awal. Struktur data tetap disiapkan untuk buku berbayar di masa depan, tapi fitur pembayaran **belum** dibuat sekarang.
- **Pengunjung mengunduh dengan memasukkan email.** PDF dikirim ke email mereka **sebagai lampiran**, dan emailnya tersimpan untuk keperluan promosi nanti (hanya jika mereka setuju).
- **CMS memakai Notion**, sama seperti blog dan project yang sudah berjalan di situs ini. Tidak ada dashboard admin.
- **File PDF tetap di Google Drive** (ukuran 2–5 MB). Server mengambilnya dari Drive lalu melampirkannya ke email. Pengunjung tidak pernah melihat link Drive.
- **Pengiriman email memakai Resend.**

Isi buku sebagian besar terjemahan kitab berbahasa Arab, tapi ada juga tulisan saya sendiri, baik bertema agama maupun umum. Jadi **jangan ada asumsi bahwa semua buku adalah buku agama atau terjemahan.**

---

## Langkah 0: Pelajari codebase dulu (wajib, sebelum menulis kode apa pun)

Pelajari dan rangkum untuk saya:

1. **Integrasi Notion yang sudah ada** untuk blog dan project: library/client yang dipakai, nama env var, cara query database, cara render body/blocks halaman Notion, strategi caching/ISR/revalidate, dan **cara menangani gambar dari Notion**. URL file yang diunggah ke Notion kedaluwarsa sekitar 1 jam, jadi cek apakah sudah ada solusinya.
2. **Sistem desain**: token warna, font (display serif dan sans body), komponen UI yang sudah ada (card, button, accordion, input, dll), serta layout dan pola halaman `/blog`, `/blog/[slug]`, dan `/course`.
3. **Library pendukung yang sudah terpasang** (validasi form seperti zod, UI kit, dll), supaya tidak menambah dependensi baru yang sebenarnya tidak perlu.
4. **Navigasi dan sitemap**: di mana menu didefinisikan dan bagaimana sitemap dibuat.

Setelah itu, **sampaikan rencana implementasi**: file apa saja yang dibuat atau diubah, dependensi baru, dan env var baru. **Tunggu persetujuan saya sebelum mulai menulis kode.**

Ikuti pola yang sudah ada di project ini. Kalau rencana di dokumen ini bertentangan dengan pola yang sudah berjalan, beri tahu saya dan usulkan cara yang paling konsisten.

---

## Model Data Notion

Saya akan membuat dua database di Notion secara manual dan menghubungkannya ke integration yang sudah ada. **Kumpulkan semua nama properti di satu file konstanta**, supaya kalau saya mengganti nama properti di Notion, cukup diubah di satu tempat.

### Database 1: `Books`

| Properti | Tipe Notion | Wajib | Keterangan |
|---|---|---|---|
| Judul | Title | ✓ | Judul buku (terjemahan / bahasa Indonesia) |
| Slug | Text | ✓ | Untuk URL `/books/[slug]` |
| Status | Select | ✓ | `Draft` / `Published`. Hanya `Published` yang tampil |
| Jenis | Select | ✓ | `Terjemahan` / `Karya Sendiri` |
| Kategori | Select | ✓ | Kelompok besar, mis. `Agama`, `Pengembangan Diri`, `HR & Karier`. Dipakai untuk filter di `/books` |
| Topik | Multi-select | | Rincian, mis. `Aqidah`, `Fiqih`, `Produktivitas` |
| Penulis | Text | | Kalau kosong dan Jenis = Karya Sendiri, isi otomatis dengan nama saya |
| Penerjemah | Text | | Biasanya nama saya, kosong untuk Karya Sendiri |
| Judul Asli | Text | | Bisa beraksara Arab atau bahasa lain |
| Bahasa Asli | Select | | mis. `Arab`, `Inggris` |
| Sinopsis | Text | ✓ | 2–3 kalimat, untuk card dan hero |
| Jumlah Halaman | Number | | |
| Ukuran File | Text | | mis. `3,2 MB` |
| Edisi | Text | | mis. `Edisi 2 · 2026` |
| Tanggal Terbit | Date | | Untuk urutan di `/books` (terbaru di atas) |
| Cover | Files & media | ✓ | |
| Pratinjau | Files & media | | Beberapa gambar: tangkapan daftar isi dan contoh halaman |
| Harga | Number | | Default 0. **Belum dipakai**, hanya disiapkan |
| Drive File ID | Text | ✓ | ID file PDF di Google Drive. **HANYA BOLEH DIBACA DI SERVER** |

**Body halaman Notion** dibagi dengan **Heading 2**. Setiap bagian bersifat opsional:

- `Deskripsi`: deskripsi lengkap
- `Daftar Isi`: daftar isi dalam bentuk teks
- `Tentang Penulis`: biografi penulis asli (untuk buku terjemahan) atau penulis lain
- `FAQ`: FAQ khusus buku ini. Setiap pertanyaan ditulis sebagai **toggle block**: judul toggle = pertanyaan, isi toggle = jawaban

Parse body berdasarkan Heading 2 tersebut. **Kalau satu bagian tidak ada, bagiannya disembunyikan.**

### Database 2: `Pembaca`

| Properti | Tipe Notion | Keterangan |
|---|---|---|
| Email | Title | |
| Nama | Text | Opsional |
| Buku | Relation → Books | |
| Tanggal | Date | Waktu permintaan unduh (ISO, zona Asia/Jakarta) |
| Setuju Promosi | Checkbox | Sesuai pilihan pengunjung di form |

---

## Halaman

Seluruh teks UI dalam **Bahasa Indonesia**, dengan gaya yang mengikuti desain editorial situs ini.

### `/books`: daftar buku

- Grid card berisi cover, judul, baris penulis (lihat aturan di bawah), dan label kategori.
- Filter berdasarkan **Kategori**: tab atau chip, dengan opsi "Semua". Simpan pilihan filter di query param (`?kategori=agama`) supaya bisa dibagikan.
- Urutkan berdasarkan Tanggal Terbit, terbaru di atas.
- Siapkan tampilan kosong yang rapi.
- Caching/ISR mengikuti pola blog.

### `/books/[slug]`: detail buku

Urutan bagian dari atas ke bawah:

1. **Hero**
   - Kiri: cover.
   - Kanan: kategori dan topik, judul, **judul asli** (jika ada), baris penulis/penerjemah, sinopsis, chip info (jumlah halaman · ukuran file · PDF · edisi; tampilkan hanya yang terisi), dan **form unduh**.
2. **Deskripsi**
3. **Daftar Isi**: teks, dalam bentuk accordion yang bisa dibuka-tutup.
4. **Pratinjau Halaman**: galeri gambar dari properti Pratinjau, bisa diklik untuk diperbesar (lightbox sederhana).
5. **Tentang Penulis** (atau "Tentang Penulis & Penerjemah"; lihat aturan di bawah).
6. **FAQ**: FAQ khusus dari Notion (jika ada) ditampilkan dulu, lalu FAQ umum dari kode, dalam satu accordion.
7. **Form unduh** sekali lagi, untuk pengunjung yang membaca sampai bawah.
8. **Buku Lainnya**: 3–4 buku dari kategori yang sama, atau buku terbaru jika kategori tersebut kurang dari 3 buku. Buku yang sedang dibuka tidak ikut ditampilkan.

Elemen tambahan:

- **Tombol bagikan ke WhatsApp** (`https://wa.me/?text=...` berisi judul dan URL halaman), ditaruh di hero.
- **Di mobile**: form di hero diganti tombol **"Unduh Gratis"** yang menempel di bagian bawah layar (sticky). Saat diketuk, form muncul sebagai bottom sheet.
- `generateMetadata`: title, description dari sinopsis, dan OG image dari cover.
- `generateStaticParams` + ISR mengikuti pola blog.
- 404 untuk slug yang tidak ada atau berstatus Draft.

### Aturan tampilan berdasarkan `Jenis`

| | Karya Sendiri | Terjemahan |
|---|---|---|
| Baris penulis | *Oleh Faqih Nur Fahmi* | *Karya {Penulis} · Diterjemahkan oleh {Penerjemah}* |
| Judul asli | tidak ditampilkan | ditampilkan jika terisi |
| Judul bagian | **Tentang Penulis** | **Tentang Penulis & Penerjemah** |
| Isi bagian | Bio saya (dari kode) | Bagian "Tentang Penulis" dari Notion, lalu bio singkat saya sebagai penerjemah (dari kode) |

Untuk buku Karya Sendiri, kalau body Notion juga punya bagian "Tentang Penulis", **pakai isi dari Notion** dan abaikan bio dari kode. Ini untuk berjaga-jaga kalau ada buku yang ditulis bersama orang lain.

### Teks berbahasa Arab

Kalau Judul Asli mengandung aksara Arab (regex `/[؀-ۿ]/`), render dengan `lang="ar"`, `dir="rtl"`, dan font Arab (mis. Amiri atau Noto Naskh Arabic via `next/font`). **Muat font Arab hanya di halaman yang membutuhkannya.**

---

## Konten yang Disimpan di Kode

Buat file konstanta (sesuaikan lokasinya dengan struktur project):

- **FAQ umum**, berlaku untuk semua buku:
  - *Apakah ebook ini benar-benar gratis?* Ya, gratis sepenuhnya. Cukup masukkan email, dan file PDF akan dikirim ke inbox Anda.
  - *Email belum masuk, bagaimana?* Tunggu beberapa menit, lalu periksa folder Spam atau Promosi. Jika tetap tidak ada, coba kirim ulang melalui form.
  - *Bolehkah ebook ini disebarkan atau dicetak?* Boleh, untuk keperluan non-komersial dan tanpa mengubah isi.
  - *Bagaimana jika saya menemukan salah ketik atau kekeliruan?* Silakan hubungi saya melalui halaman Kontak. Masukan Anda sangat berarti untuk edisi berikutnya.
  - *Apakah email saya akan disebarkan?* Tidak. Email hanya dipakai untuk mengirim ebook dan, jika Anda menyetujuinya, kabar buku baru.
- **Bio penulis**: versi lengkap (untuk Karya Sendiri) dan versi singkat 1–2 kalimat (sebagai penerjemah). Isi dengan **placeholder yang jelas** (mis. `TODO: bio penulis`); nanti saya isi sendiri.
- **Kalimat izin penyebaran**: *"Ebook ini boleh disebarkan untuk keperluan non-komersial tanpa mengubah isinya."* Tampilkan kecil di bawah form unduh.

---

## Form Unduh

Isi form:

- **Nama** (opsional)
- **Email** (wajib, divalidasi)
- **Checkbox persetujuan, TIDAK tercentang secara default**: *"Saya bersedia menerima kabar buku baru dari Faqih Nur Fahmi."*
- **Cloudflare Turnstile** (anti-bot)
- **Field honeypot** yang disembunyikan
- Tombol: **"Kirim ke Email Saya"**
- Teks kecil di bawahnya: email hanya dipakai untuk mengirim ebook, dan tidak dibagikan ke pihak lain.

Perilaku form:

- **Loading** pada tombol saat proses berjalan, dan tombol tidak bisa diklik dua kali.
- **Sukses**: form diganti pesan inline, mis. *"Ebook sedang dalam perjalanan ke {email}. Jika belum masuk dalam beberapa menit, periksa folder Spam atau Promosi."* Tidak perlu halaman terpisah.
- **Gagal**: pesan ramah dalam Bahasa Indonesia, dan form tetap bisa dicoba lagi.

---

## API Route: `POST /api/books/download`

Alur:

1. **Validasi input**: slug, email, nama (opsional), persetujuan (boolean), token Turnstile, honeypot.
2. **Honeypot terisi?** Kembalikan respons sukses palsu dan jangan lakukan apa pun.
3. **Verifikasi token Turnstile di server.**
4. **Ambil buku dari Notion** berdasarkan slug (hanya yang Published), termasuk Drive File ID.
5. **Cegah kirim berulang**: jika di database Pembaca sudah ada baris dengan email dan buku yang sama dalam **10 menit terakhir**, jangan kirim lagi. Kembalikan respons sukses dengan pesan bahwa email sudah dikirim dan sebaiknya cek folder Spam.
6. **Ambil PDF dari Google Drive**: lihat bagian di bawah.
7. **Kirim email via Resend** dengan PDF sebagai lampiran, nama file `{slug}.pdf`.
8. **Simpan ke database Pembaca** *setelah* email berhasil terkirim. Jika penyimpanan gagal, catat error di log tapi tetap kembalikan respons sukses ke pengunjung, karena email sudah terkirim.
9. Kembalikan respons `{ ok: true }` atau error yang jelas.

### Mengambil PDF dari Google Drive

Untuk tahap awal, file Drive berstatus **"Anyone with the link can view"** (kondisinya sudah begitu sekarang). Ambil file lewat URL unduhan langsung:

```
https://drive.google.com/uc?export=download&id={DRIVE_FILE_ID}
```

- Taruh logika ini dalam **satu fungsi terisolasi** (mis. `getBookPdf(fileId): Promise<Buffer>`), supaya nanti mudah diganti ke Google Drive API dengan service account tanpa mengubah kode lain.
- **Validasi hasilnya benar-benar PDF**: cek bahwa buffer diawali `%PDF`. Kalau Drive mengembalikan halaman HTML (file privat, ID salah, dll), lempar error yang jelas di log.

### Keamanan

- **Drive File ID tidak boleh pernah sampai ke browser**, baik di props, di payload RSC, maupun di respons API. Pisahkan tipe data "buku publik" dan "buku internal (server)", dan pakai `import "server-only"` di modul yang mengakses Drive File ID.
- Semua secret hanya ada di env var server.

---

## Email

- **Pengirim**: `Faqih Nur Fahmi <buku@faqih.id>` (lewat env var).
- **Subjek**: `Ebook: {Judul}`
- **Isi** (HTML sederhana yang rapi dan senada dengan situs; pakai React Email jika sudah ada di project, kalau tidak cukup template HTML):
  - Salam dengan nama jika diisi, atau sapaan umum jika tidak.
  - Terima kasih, dan keterangan bahwa ebook terlampir.
  - Kalimat izin penyebaran.
  - Tautan ke `https://faqih.id/books` untuk buku lainnya.
  - Footer singkat: alasan pengunjung menerima email ini (karena meminta ebook di faqih.id).

---

## Lain-lain

- Tambahkan menu **"Buku"** di navigasi situs, mengikuti urutan dan gaya menu yang sudah ada.
- Masukkan `/books` dan semua `/books/[slug]` ke **sitemap**.
- Buat file **`.env.example`** (atau perbarui yang sudah ada) dengan env var baru, kurang lebih:
  - `NOTION_BOOKS_DATABASE_ID`
  - `NOTION_READERS_DATABASE_ID`
  - `RESEND_API_KEY`
  - `BOOKS_EMAIL_FROM`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

  Sesuaikan dengan konvensi nama yang sudah ada di project.
- Buat **`docs/books-setup.md`** berisi panduan setup singkat:
  - membuat dua database Notion dengan properti persis seperti di atas, lalu menghubungkannya ke integration;
  - verifikasi domain `faqih.id` di Resend (DNS `faqih.id` dikelola di **Cloudflare**, jadi record SPF/DKIM/MX dari Resend ditambahkan di dashboard Cloudflare dengan status *DNS only*);
  - membuat site key Cloudflare Turnstile (di akun Cloudflare yang sama dengan DNS `faqih.id`);
  - cara mengambil Drive File ID dari link Google Drive.

---

## Di Luar Cakupan (jangan dikerjakan sekarang)

Hal-hal berikut hanya konteks untuk tahap berikutnya:

- Pembayaran untuk buku berbayar (properti Harga sudah disiapkan).
- Penghitung jumlah unduhan ("Telah diunduh X kali").
- Link "Buka PDF" bertoken di dalam email, sebagai cadangan jika lampiran terblokir.
- Pengiriman email promosi/broadcast.
- Redirect dari `marifah.id/ebook`, karena itu ada di project lain.

---

## Kriteria Selesai

- [ ] `/books` menampilkan semua buku Published, dan filter kategori berfungsi.
- [ ] `/books/[slug]` menampilkan semua bagian sesuai urutan, dan bagian yang kosong tersembunyi.
- [ ] Tampilan untuk buku Terjemahan dan Karya Sendiri berbeda sesuai aturan.
- [ ] Judul berbahasa Arab tampil dari kanan ke kiri dengan font Arab.
- [ ] Mengisi form akan mengirim email berisi lampiran PDF yang bisa dibuka.
- [ ] Baris baru muncul di database Pembaca, dengan relasi buku dan status persetujuan yang benar.
- [ ] Mengirim ulang dalam 10 menit tidak menghasilkan email kedua.
- [ ] Drive File ID tidak muncul di mana pun di sisi browser (cek page source dan respons network).
- [ ] Tampilan mobile: tombol sticky dan bottom sheet berfungsi baik.
- [ ] `npm run build` (atau perintah build project ini) lolos tanpa error, termasuk type check dan lint.
