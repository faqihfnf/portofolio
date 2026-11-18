import "./globals.css";
import "./editorial.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import ThemeProvider from "@/providers/ThemeProvider";
import I18nProvider from "@/providers/I18nProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL("https://faqih.id"),
  title: {
    default: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Software Engineer",
    template: "%s | Faqih Nur Fahmi",
  },
  description: "Faqih Nur Fahmi adalah HR Manager bersertifikasi BNSP dengan pengalaman lebih dari 9 tahun di bidang manajemen SDM, pengembangan organisasi, dan solusi digital yang praktis.",
  authors: [{ name: "Faqih Nur Fahmi", url: "https://faqih.id" }],
  creator: "Faqih Nur Fahmi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Faqih Nur Fahmi",
    title: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Software Engineer",
    description: "HR Manager bersertifikasi BNSP yang menghubungkan manusia, proses organisasi, dan teknologi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Software Engineer",
    description: "HR Manager bersertifikasi BNSP yang menghubungkan manusia, proses organisasi, dan teknologi.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Person + Organization saling merujuk lewat @id — schema.org menaruh
  // properti `founder` di Organization, bukan di Person.
  const PERSON_ID = "https://faqih.id/#person";
  const WAWANCARAI_ID = "https://wawancarai.com/#organization";

  const personSchema = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Faqih Nur Fahmi",
    jobTitle: "HR Manager & Software Engineer",
    description: "HR Manager bersertifikasi BNSP dengan kemampuan software engineering.",
    url: "https://faqih.id",
    image: "https://faqih.id/profil.png",
    sameAs: ["https://github.com/faqihfnf", "https://www.linkedin.com/in/faqihnurfahmi/", "https://www.instagram.com/faqih.me", "https://www.youtube.com/@marifahid"],
    knowsAbout: ["Human Resource Management", "People Management", "Organizational Development", "Digital Transformation", "Software Engineering"],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Certified HR Manager",
      credentialCategory: "Professional Certification",
      recognizedBy: {
        "@type": "Organization",
        name: "BNSP",
      },
    },
    worksFor: { "@id": WAWANCARAI_ID },
  };

  const wawancaraiSchema = {
    "@type": "Organization",
    "@id": WAWANCARAI_ID,
    name: "Wawancarai",
    url: "https://wawancarai.com",
    description: "Membantu pencari kerja Indonesia menyiapkan lamaran: cek kecocokan CV dengan lowongan, perbaiki CV dengan jujur, dan latihan wawancara dengan suara.",
    founder: { "@id": PERSON_ID },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [personSchema, wawancaraiSchema],
  };

  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.className}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <I18nProvider>
          <ThemeProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <Footer />
            <Analytics />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
