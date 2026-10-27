import AboutSection from "@/component/AboutSection";
import ContactSection from "@/component/ContactSection";
import ExpertiseSection from "@/component/ExpertiseSection";
import FloatingNavbar from "@/component/FloatingNavbar";
import IntroSection from "@/component/IntroSection";
import MaskRevealBanner from "@/component/MaskRevealBanner";
import ProjectsSection from "@/component/ProjectsSection";
import WorkExperience from "@/component/WorkExperience";


export default function Home() {
  return (
    <main>
      <FloatingNavbar />

      {/* name, role, contacts and skills come from the banner's CV defaults */}
      <MaskRevealBanner
        frontImageSrc="/images/img-3.png"
        backImageSrc="/images/img-4.png"
        nextSectionId="intro"
      />

      <IntroSection id="intro" />

      <AboutSection id="about" imageSrc="/images/about-img.jpeg" />

      <ExpertiseSection id="expertise" />

      <WorkExperience id="experience" />

      <ProjectsSection id="projects" />

      {/* big WhatsApp / Instagram / LinkedIn / Email tiles + CV download.
          Needs /public/cv/Jishnu_Narayanan_Resume.pdf */}
      <ContactSection
        id="contact"
        instagramUrl="https://www.instagram.com/your_handle"
        instagramHandle="@your_handle"
      />

    </main>
  );
}