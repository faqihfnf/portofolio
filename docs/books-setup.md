# Panduan Setup Halaman Buku (`/books`)

Halaman buku memakai empat layanan: **Notion** (CMS), **Google Drive** (file PDF), **Resend** (pengiriman email), dan **Cloudflare Turnstile** (anti-bot). Ikuti langkah di bawah secara berurutan, lalu isi env var di bagian akhir.

## 1. Database Notion

Buat dua database di Notion. **Nama dan tipe properti harus persis sama** dengan tabel di bawah (huruf besar/kecil dan spasi ikut dihitung). Kalau suatu saat ingin mengganti nama properti, ubah juga di `src/services/books/properties.ts`.

### Database `Books`

| Properti | Tipe Notion | Wajib | Keterangan |
|---|---|---|---|
| Judul | Title | ✓ | Judul buku |
| Slug | Text | ✓ | Untuk URL `/books/[slug]`. Huruf kecil dan tanda hubung, mis. `ushul-tsalatsah`. Buku tanpa slug tidak tampil |
| Status | Select | ✓ | Opsi: `Draft`, `Published`. Hanya `Published` yang tampil |
| Jenis | Select | ✓ | Opsi: `Terjemahan`, `Karya Sendiri` |
| Kategori | Select | ✓ | mis. `Agama`, `Pengembangan Diri`, `HR & Karier`. Jadi filter di `/books` |
| Topik | Multi-select | | mis. `Aqidah`, `Fiqih`, `Produktivitas` |
| Penulis | Text | | Kosong + Jenis `Karya Sendiri` → otomatis nama Anda |
| Penerjemah | Text | | Kosong + Jenis `Terjemahan` → otomatis nama Anda |
| Judul Asli | Text | | Hanya tampil untuk `Terjemahan`. Aksara Arab otomatis tampil kanan-ke-kiri dengan font Arab |
| Bahasa Asli | Select | | mis. `Arab`, `Inggris` |
| Sinopsis | Text | ✓ | 2–3 kalimat, untuk hero dan deskripsi SEO |
| Jumlah Halaman | Number | | |
| Ukuran File | Text | | mis. `3,2 MB` |
| Edisi | Text | | mis. `Edisi 2 · 2026` |
| Tanggal Terbit | Date | | Menentukan urutan (terbaru di atas) |
| Cover | Files & media | ✓ | Gambar sampul, sebaiknya JPG/PNG potret (rasio ±5:7) |
| Pratinjau | Files & media | | Beberapa gambar: daftar isi, contoh halaman |
| Harga | Number | | Isi `0`. Belum dipakai |
| Drive File ID | Text | ✓ | ID file PDF di Google Drive (lihat bagian 2) |

**Body halaman** setiap buku dibagi dengan **Heading 2**. Semua bagian opsional; bagian yang tidak ada otomatis disembunyikan:

- `Deskripsi` — deskripsi lengkap. Teks yang ditulis sebelum Heading 2 pertama juga dianggap deskripsi.
- `Daftar Isi` — daftar isi berupa teks (list biasa sudah cukup).
- `Tentang Penulis` — biografi penulis asli, atau penulis lain untuk buku yang ditulis bersama.
- `FAQ` — setiap pertanyaan ditulis sebagai **toggle block**: judul toggle = pertanyaan, isi toggle = jawaban.

### Database `Pembaca`

| Properti | Tipe Notion | Keterangan |
|---|---|---|
| Email | Title | |
| Nama | Text | |
| Buku | Relation → `Books` | |
| Tanggal | Date | Waktu permintaan unduh (WIB) |
| Setuju Promosi | Checkbox | Tercentang hanya jika pengunjung menyetujuinya |

Database ini diisi otomatis setiap kali ebook berhasil dikirim. Untuk promosi nanti, **pakai hanya baris yang `Setuju Promosi`-nya tercentang**.

### Menghubungkan ke integration

1. Buka masing-masing database sebagai halaman penuh → menu `•••` di kanan atas → **Connections** → pilih integration yang sama dengan blog (yang token-nya ada di `NOTION_TOKEN`).
2. Salin ID database dari URL-nya: `https://www.notion.so/<workspace>/<DATABASE_ID>?v=...` (32 karakter sebelum `?v=`).
3. Isi `NOTION_BOOKS_ID` dan `NOTION_READERS_ID`.

> Perubahan di Notion tampil di situs paling lama 30 menit kemudian (cache yang sama dengan blog).

## 2. File PDF di Google Drive

1. Unggah PDF ke Google Drive, lalu klik kanan → **Share** → General access: **Anyone with the link** (Viewer).
2. Salin link-nya. Bentuknya:
   `https://drive.google.com/file/d/`**`1AbCdEfGhIjKlMnOpQrStUvWxYz012345`**`/view?usp=sharing`
3. Bagian di antara `/d/` dan `/view` itulah **Drive File ID**. Tempel ke properti `Drive File ID` di Notion.

Pengunjung tidak pernah melihat link atau ID ini: server mengambil PDF dari Drive lalu melampirkannya ke email. Kalau file dibuat privat atau ID-nya salah, pengiriman gagal dan log server mencatat `File Drive ... bukan PDF`.

## 3. Resend (pengiriman email)

1. Daftar di [resend.com](https://resend.com) → **Domains** → **Add Domain** → `faqih.id`.
2. Resend menampilkan beberapa DNS record (DKIM `TXT`, SPF `TXT`, dan `MX` untuk subdomain `send`). Tambahkan semuanya di **Cloudflare** → domain `faqih.id` → **DNS** → **Records**.
   - Untuk setiap record, set **Proxy status: DNS only** (awan abu-abu, bukan oranye).
   - Salin nama dan nilai record apa adanya dari dashboard Resend.
3. Kembali ke Resend → klik **Verify**. Tunggu sampai status domain menjadi **Verified**.
4. **API Keys** → **Create API Key** (permission *Sending access* sudah cukup) → isi `RESEND_API_KEY`.
5. `BOOKS_EMAIL_FROM` berisi nama dan alamat pengirim, mis. `Faqih Nur Fahmi <buku@faqih.id>`. Alamatnya harus memakai domain yang sudah terverifikasi.

## 4. Cloudflare Turnstile (anti-bot)

1. Masuk ke dashboard Cloudflare (akun yang sama dengan DNS `faqih.id`) → **Turnstile** → **Add widget**.
2. Hostname: `faqih.id`. Tambahkan juga `localhost` kalau ingin menguji di komputer sendiri dengan kunci asli. Widget mode: **Managed**.
3. Salin **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, dan **Secret Key** → `TURNSTILE_SECRET_KEY`.

Untuk pengembangan lokal, Cloudflare menyediakan kunci uji yang selalu lolos: site key `1x00000000000000000000AA` dan secret key `1x0000000000000000000000000000000AA`. **Jangan dipakai di produksi.** Kunci asli di `localhost` sering gagal dengan error `300030` (tantangan dianggap mencurigakan karena DevTools, ekstensi browser, dll.), jadi taruh kunci uji di `.env.development.local`. File itu hanya dibaca saat `npm run dev` dan menimpa `.env`, sehingga build dan produksi tetap memakai kunci asli.

## 5. Env var

Tambahkan ke `.env` (lokal) dan ke pengaturan Environment Variables di hosting, lalu deploy ulang:

```
NOTION_BOOKS_ID=
NOTION_READERS_ID=
RESEND_API_KEY=
BOOKS_EMAIL_FROM="Faqih Nur Fahmi <buku@faqih.id>"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

## 6. Konten yang diisi di kode

File `src/data/books.ts` berisi FAQ umum, kalimat izin penyebaran, dan **bio penulis** (`AUTHOR_BIO_FULL` dan `AUTHOR_BIO_SHORT`). Bio masih berupa placeholder `TODO: ...`; selama belum diganti, bio tidak ditampilkan di situs.

## 7. Uji coba

1. Buat satu buku berstatus `Published` dengan Cover, Sinopsis, dan Drive File ID.
2. Buka `/books`, masuk ke halaman bukunya, isi form dengan email Anda sendiri.
3. Periksa: email masuk dengan lampiran `{slug}.pdf` yang bisa dibuka, dan ada baris baru di database `Pembaca`.
4. Kirim ulang dengan email yang sama dalam 10 menit: tidak ada email kedua, dan form menampilkan pesan bahwa ebook sudah dikirim.

Kalau ada yang gagal, lihat log server. Setiap kegagalan dicatat dengan awalan `[books/download]`.
