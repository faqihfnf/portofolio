//@ts-ignore
import "./globals.css";
import "./editorial.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import ReduxProvider from "@/providers/ReduxProvider";
import I18nProvider from "@/providers/I18nProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL("https://faqih.id"),
  title: {
    default: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Full Stack Developer",
    template: "%s | Faqih Nur Fahmi",
  },
  description: "Faqih Nur Fahmi is an HR Manager and BNSP Certified HR Manager with 9+ years of experience in people management, organizational development, and practical digital solutions.",
  authors: [{ name: "Faqih Nur Fahmi", url: "https://faqih.id" }],
  creator: "Faqih Nur Fahmi",
  alternates: {
    canonical: "/",
  },
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
    locale: "en_US",
    siteName: "Faqih Nur Fahmi",
    title: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Full Stack Developer",
    description: "HR Manager and BNSP Certified HR Manager combining people, organizational processes, and technology.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faqih Nur Fahmi — Certified HR Manager (BNSP) & Full Stack Developer",
    description: "HR Manager and BNSP Certified HR Manager combining people, organizational processes, and technology.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Faqih Nur Fahmi",
    jobTitle: "HR Manager",
    description: "HR Manager and BNSP Certified HR Manager with full-stack development skills.",
    url: "https://faqih.id",
    image: "https://faqih.id/profil.png",
    sameAs: ["https://github.com/faqihfnf", "https://www.linkedin.com/in/faqih-nur-fahmi-b51bb1ab/", "https://www.instagram.com/faqih.me", "https://www.youtube.com/@marifahid"],
    knowsAbout: ["Human Resource Management", "People Management", "Organizational Development", "Digital Transformation", "Full Stack Development"],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: "Certified HR Manager",
      credentialCategory: "Professional Certification",
      recognizedBy: {
        "@type": "Organization",
        name: "BNSP",
      },
    },
  };

  return (
    <html lang="en" className="" data-scroll-behavior="smooth">
      <body className={`${inter.className} ${poppins.className}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <I18nProvider>
          <ReduxProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <Footer />
            <Analytics />
          </ReduxProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
