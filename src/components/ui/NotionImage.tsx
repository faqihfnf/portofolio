import Image from "next/image";
import type { CSSProperties, MouseEventHandler } from "react";

/** https://cdn.faqih.id — diisi next.config.ts dari R2_PUBLIC_URL saat build */
const IMAGE_CDN = process.env.NEXT_PUBLIC_IMAGE_CDN;

interface NotionImageProps {
  src: string;
  alt: string;
  /** Ukuran intrinsik perkiraan (rasio). Tampilan sebenarnya tetap diatur className. */
  width: number;
  height: number;
  /** Lebar tampilan per breakpoint, supaya browser mengunduh ukuran yang pas */
  sizes: string;
  /** Untuk gambar utama di layar pertama (cover) */
  preload?: boolean;
  loading?: "lazy" | "eager";
  /**
   * Kirim file asli tanpa srcset. Untuk tampilan "ukuran asli" seperti lightbox: dengan srcset, file kecil
   * yang dikirim untuk kandidat lebar (mis. w=1920) dianggap ber-DPR tinggi dan malah tampil mengecil.
   */
  unoptimized?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLImageElement>;
}

/**
 * Gambar dari Notion (cover blog/proyek/buku, pratinjau, gambar di isi artikel).
 *
 * - Sudah tersalin ke CDN R2 (URL permanen) → next/image: dikonversi ke WebP/AVIF dan diperkecil
 *   sesuai `sizes`.
 * - Selain itu (link eksternal, atau URL Notion bertanda tangan yang berganti tiap ±1 jam saat
 *   penyalinan gagal) → <img> biasa, karena optimasi untuk URL yang segera kedaluwarsa sia-sia.
 */
export default function NotionImage({ src, alt, width, height, sizes, preload, loading, unoptimized, className, style, onClick }: NotionImageProps) {
  if (IMAGE_CDN && src.startsWith(`${IMAGE_CDN}/`)) {
    return <Image src={src} alt={alt} width={width} height={height} sizes={sizes} preload={preload} loading={loading} unoptimized={unoptimized} className={className} style={style} onClick={onClick} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} loading={preload ? "eager" : loading} className={className} style={style} onClick={onClick} />;
}
