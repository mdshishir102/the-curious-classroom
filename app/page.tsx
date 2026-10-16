import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import WhyChooseUs from "@/components/WhyChooseUs";
import LearningExperience from "@/components/LearningExperience";
import YoutubeClasses from "@/components/YoutubeClasses";
import Teachers from "@/components/Teachers";
import StudentSuccess from "@/components/StudentSuccess";
import AdmissionCTA from "@/components/AdmissionCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080D19]">
      <Hero />
      <Programs />
      <WhyChooseUs />
      <LearningExperience />
      <YoutubeClasses />
      <Teachers />
      <StudentSuccess />
      <AdmissionCTA />
    </main>
  );
}