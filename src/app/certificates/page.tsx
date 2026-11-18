import { Metadata } from "next";
import CertificatesClient from "@/components/sections/certificates/CertificatesClient";

export const metadata: Metadata = {
  title: "Sertifikasi HR Manager & Software Engineer",
  description: "Sertifikasi profesional Faqih Nur Fahmi, termasuk sertifikasi HR Manager BNSP, analisis data, keamanan informasi, dan pengembangan software.",
  alternates: { canonical: "/certificates" },
};

export default function CertificatesPage() {
  return <CertificatesClient />;
}
