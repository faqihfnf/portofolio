import type { Metadata } from "next";
import CoursePageClient from "./CoursePageClient";

export const metadata: Metadata = {
  title: "Courses and Learning",
  description: "Courses and learning resources covering HR, organizational development, data, automation, and software development.",
  alternates: { canonical: "/course" },
};

export default function CoursePage() {
  return <CoursePageClient />;
}
