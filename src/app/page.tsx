import type { Metadata } from "next";
import AboutMe from "@/components/sections/home/AboutMe";
import CallToAction from "@/components/sections/home/CallToAction";
import GithubContribution from "@/components/sections/home/GithubContribution";
import HeroSection from "@/components/sections/home/HeroSection";
import MyServices from "@/components/sections/home/MyServices";
import TechStack from "@/components/sections/home/TechStack";
import Testimonials from "@/components/sections/home/Testimonials";
import { fraunces, inter } from "@/components/editorial/fonts";

// Canonical per halaman — root layout sengaja tidak mengisi canonical
// supaya tidak terwariskan ke halaman lain (mis. detail project)
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className={`${fraunces.variable} ${inter.variable} editorial min-h-screen`}>

      {/* Hero Section */}
      <HeroSection />

      {/* My Services Section */}
      <MyServices />

      {/* Tech Stack Section */}
      <TechStack />

      {/* About Me Section */}
      <AboutMe />

      {/* Testimonials Section */}
      <Testimonials />

      {/* GitHub Contributions Section */}
      <GithubContribution />

      {/* CTA Section */}
      <CallToAction />
    </div>
  );
}
