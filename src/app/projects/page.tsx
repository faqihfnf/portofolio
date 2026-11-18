import { getProjects } from "@/services/notionServices";
import ProjectsClient from "@/components/sections/projects/ProjectClient";
import { Metadata } from "next";

// ISR: halaman disajikan dari cache dan dibuat ulang di latar belakang paling sering tiap 5 menit.
// Aman karena URL gambar sudah permanen (disalin ke R2), tidak lagi URL Notion yang kedaluwarsa ±1 jam.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Proyek Teknologi HR dan Digital",
  description: "Produk digital, tools internal, dan solusi teknologi praktis yang dibangun untuk menjawab tantangan organisasi dan bisnis.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsClient projects={projects} />;
}
