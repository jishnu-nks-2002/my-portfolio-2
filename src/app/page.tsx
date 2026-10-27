import AboutSection from "@/component/AboutSection";
import ContactSection from "@/component/ContactSection";
import ExpertiseSection from "@/component/ExpertiseSection";
import FloatingNavbar from "@/component/FloatingNavbar";
import IntroSection from "@/component/IntroSection";
import MaskRevealBanner from "@/component/MaskRevealBanner";
import Preloader from "@/component/Preloader";
import ProjectsSection from "@/component/ProjectsSection";
import WorkExperience from "@/component/WorkExperience";

export default function Home() {
  return (
    <main>
      {/* developer-style loading screen — removes itself when the page is ready */}
      <Preloader />

      <FloatingNavbar />

      {/* name, role, contacts and skills come from the banner's CV defaults */}
      <MaskRevealBanner
        frontImageSrc="/images/img-3.png"
        backImageSrc="/images/img-4.png"
        nextSectionId="intro"
      />

      <IntroSection id="intro" />

      <AboutSection id="about" imageSrc="/images/footer.png" />

      <ExpertiseSection id="expertise" />

      <WorkExperience id="experience" />

      <ProjectsSection id="projects" />

      {/* big WhatsApp / Instagram / LinkedIn / Email tiles + CV download.
          Needs /public/cv/Jishnu_Narayanan_Resume.pdf */}
      <ContactSection
        id="contact"
        instagramUrl="https://www.instagram.com/_._j_._u_._?rpxt=ODA4cW05ZjFnb3dq"
        instagramHandle="_._j_._u_._"
      />
    </main>
  );
}