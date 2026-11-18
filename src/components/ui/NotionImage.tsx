import type { ImgHTMLAttributes } from "react";

type NotionImageProps = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };

/**
 * Gambar dari Notion (cover blog/proyek/buku, pratinjau, gambar di isi artikel).
 *
 * Sengaja <img> biasa, bukan next/image: URL file unggahan Notion bertanda tangan dan berganti
 * setiap ±1 jam, sehingga optimasi next/image hanya menumpuk cache (dan kuota optimasi) untuk
 * URL yang segera kedaluwarsa.
 */
export default function NotionImage({ alt, ...props }: NotionImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} {...props} />;
}
