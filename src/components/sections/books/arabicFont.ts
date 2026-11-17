import { Amiri } from "next/font/google";

// Font Arab untuk Judul Asli. File ini hanya diimpor oleh halaman detail buku, dan
// preload dimatikan — jadi file font baru diunduh browser kalau memang ada teks Arab di halaman.
export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
