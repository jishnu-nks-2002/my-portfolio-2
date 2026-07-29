import AboutSection from "@/component/AboutSection";
import CustomCursor from "@/component/CustomCursor";
import ExpertiseSection from "@/component/ExpertiseSection";
import FloatingNavbar from "@/component/FloatingNavbar";
import IntroSection from "@/component/IntroSection";
import MaskRevealBanner from "@/component/MaskRevealBanner";
import ProjectsCollection from "@/component/ProjectsCollection";
import WorkExperience from "@/component/WorkExperience";
import Image from "next/image";

export default function Home() {
  return (
  <div>
    <CustomCursor ringSize={10} hoverRingSize={10} color="#f97316" />
<FloatingNavbar/>

<MaskRevealBanner
  frontImageSrc="  /images/img-2.jpeg"
  backImageSrc="/images/img-1.jpeg "
  mark="W."
  sideLabel="Honors"
  email="you@site.com"
/>
<IntroSection 
        label="// INTRO"
      />
  <AboutSection 
        imageSrc="/images/about-img.jpeg"
        heading="23 years building UX organizations that outperform."
      />
      <ExpertiseSection/>

      <WorkExperience/>

      <ProjectsCollection/>

      


  </div>
  );
}