import type { Metadata } from "next";
import CoursePageClient from "./CoursePageClient";

export const metadata: Metadata = {
  title: "Kursus dan Pembelajaran",
  description: "Kursus dan materi belajar seputar HR, pengembangan organisasi, data, otomasi, dan pengembangan software.",
  alternates: { canonical: "/course" },
};

export default function CoursePage() {
  return <CoursePageClient />;
}
