import { getProjects, getPageBlocks } from "@/services/notionServices";
import NotionBlockRenderer from "@/components/sections/blog/NotionBlockRenderer";
import Link from "next/link";
import { fraunces, inter } from "@/components/editorial/fonts";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Metadata per project — tanpa ini canonical & title jatuh ke default situs
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const description = project.description || `${project.title} — project by Faqih Nur Fahmi`;

  // Gambar OG tidak diisi dari cover Notion (URL-nya kedaluwarsa ±1 jam),
  // jadi tetap memakai opengraph-image bawaan situs
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description,
      type: "article",
      url: `https://faqih.id/projects/${slug}`,
      siteName: "Faqih Nur Fahmi",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  // Slug tidak dikenal → status 404 asli, bukan 200 (soft 404)
  if (!project) notFound();

  const blocks = await getPageBlocks(project.id);

  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>
      <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        {/* Back */}
        <Link href="/projects" className="ed-link inline-block text-[11px] uppercase tracking-[0.18em]">
          &larr; Projects
        </Link>

        {/* Header */}
        <h1 className="ed-serif mt-8 text-3xl leading-tight tracking-tight md:text-[2.75rem] md:leading-[1.15]">{project.title}</h1>

        {/* Meta: teknologi sebagai teks kecil */}
        {project.technologies.length > 0 && (
          <p className="mt-4 text-[13px] text-[var(--ed-text-muted)]">
            {project.technologies.map((tech, i) => (
              <span key={tech}>
                {tech}
                {i < project.technologies.length - 1 && <span className="text-[var(--ed-border)]">{" · "}</span>}
              </span>
            ))}
          </p>
        )}

        {/* Links — teks underline bronze */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="mt-6 flex gap-8 border-b border-[var(--ed-border)] pb-8">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="ed-link text-[11px] uppercase tracking-[0.18em]">
                GitHub
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="ed-link text-[11px] uppercase tracking-[0.18em]">
                Live Demo
              </a>
            )}
          </div>
        )}

        {/* Cover */}
        {project.cover && <img src={project.cover} alt={project.title} className="mt-10 w-full rounded-[2px] border border-[var(--ed-border)] object-cover" />}

        {/* Notion Content */}
        <div className={project.cover ? "mt-10" : "mt-2"}>{blocks.length > 0 ? <NotionBlockRenderer blocks={blocks} /> : <p className="py-10 text-center text-[var(--ed-text-muted)]">Belum ada konten detail untuk project ini.</p>}</div>
      </div>
    </div>
  );
}
