import { getProjects } from "@/services/notionServices";
import ProjectsClient from "@/components/sections/projects/ProjectClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyek Teknologi HR dan Digital",
  description: "Produk digital, tools internal, dan solusi teknologi praktis yang dibangun untuk menjawab tantangan organisasi dan bisnis.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsClient projects={projects} />;
}
