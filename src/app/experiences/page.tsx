import { Metadata } from "next";
import ExperienceClient from "@/components/sections/experiences/ExperienceClient";

export const metadata: Metadata = {
  title: "Pengalaman HR Manager & Software Engineer",
  description: "Pengalaman profesional Faqih Nur Fahmi sebagai HR Manager di bidang manajemen SDM, pengembangan organisasi, strategi HR, dan transformasi digital.",
  alternates: { canonical: "/experiences" },
};

export default function ExperiencePage() {
  return <ExperienceClient />;
}
