import type { NextConfig } from "next";

// Header keamanan dasar untuk semua halaman. CSP sengaja belum dipasang karena situs memuat
// skrip pihak ketiga (EmailJS, Cloudflare Turnstile, Vercel Analytics) yang perlu diuji satu per satu.
const securityHeaders = [
  // Cegah situs lain menyematkan halaman ini di iframe (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Browser tidak boleh menebak tipe konten di luar Content-Type yang dikirim
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Kirim origin saja ke situs lain, URL lengkap hanya ke situs sendiri
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Situs ini tidak memakai kamera, mikrofon, atau lokasi
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
