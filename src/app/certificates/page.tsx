import { Metadata } from "next";
import CertificatesClient from "@/components/sections/certificates/CertificatesClient";

export const metadata: Metadata = {
  title: "HR Manager Certifications",
  description: "Professional certifications held by Faqih Nur Fahmi, including BNSP HR Manager certification, data analytics, information security, and software development.",
  alternates: { canonical: "/certificates" },
};

export default function CertificatesPage() {
  return <CertificatesClient />;
}
