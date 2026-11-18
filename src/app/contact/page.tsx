import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Hubungi Faqih Nur Fahmi",
  description: "Hubungi Faqih Nur Fahmi untuk berdiskusi seputar manajemen SDM, pengembangan organisasi, transformasi digital, dan solusi teknologi yang praktis.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
