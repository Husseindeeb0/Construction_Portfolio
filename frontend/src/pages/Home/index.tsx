import Navbar from "../../components/layout/Navbar";
import HeroSection from "../../components/HomeComponents/HeroSection";
import AboutSection from "../../components/HomeComponents/AboutSection";
import ServicesSection from "../../components/HomeComponents/ServicesSection";
import TrackRecordSection from "../../components/HomeComponents/TrackRecordSection";
import ProjectsSection from "../../components/HomeComponents/ProjectsSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <TrackRecordSection />
        <ProjectsSection />
      </main>

      {/* Footer */}
      <footer className="bg-[#1b2b4b] text-white/60 text-center py-8 px-6 text-sm border-t border-white/10">
        © {new Date().getFullYear()} Constructify. All rights reserved.
      </footer>
    </div>
  );
}
