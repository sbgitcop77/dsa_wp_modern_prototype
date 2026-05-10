import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Training Programs",
  description:
    "Explore baseball and softball training programs at The Diamond Sports Academy — private lessons, group sessions, pitching, hitting, speed & agility, and more.",
};

export default function TrainingPage() {
  return (
    <ServicePageLayout
      badge="Training"
      headline="What to Expect from Our Training Programs"
      heroBg="/images/weights-on-rack.webp"
      heroAlt="Training"
      introParagraphs={[
        "At The Diamond Sports Academy, our training programs are designed to unlock every athlete's full potential through focused instruction, modern technology, and structured repetition. Whether you're preparing for the next level or just starting your journey, our coaches provide the guidance, accountability, and motivation needed to achieve real results.",
        [
          "Individualized Coaching: Personalized instruction focused on each player's strengths, weaknesses, and goals.",
          "Skill-Specific Sessions: Targeted training for hitting, pitching, catching, fielding, and throwing.",
          "Data-Driven Improvement: Track progress using HitTrax, Rapsodo, and other advanced performance tools.",
          "Strength & Conditioning: Build power, speed, and durability through proven athletic development programs.",
          "Professional Mentorship: Learn from instructors with collegiate and professional playing experience.",
        ],
      ]}
      whyTitle="Why Train at The Diamond Sports Academy?"
      whyParagraphs={[
        "Our approach to training goes far beyond drills — it's about developing the complete athlete. From mental preparation to physical conditioning, we focus on helping players perform under pressure and compete with confidence. Every session is structured, measurable, and designed to build long-term success on and off the field.",
        [
          "One-on-one and small group options for personalized instruction.",
          "Comprehensive focus on mechanics, mindset, and consistency.",
          "Integrated performance technology for accurate feedback and results tracking.",
          "Supportive environment that motivates athletes to stay disciplined and goal-driven.",
        ],
      ]}
      whoTitle="Who Can Participate?"
      whoText="Our training programs are open to baseball and softball players of all ages and experience levels. Whether you're an aspiring youth athlete, a travel ball player refining your mechanics, or a high school prospect preparing for college competition, our coaches will customize your training plan to meet your needs and elevate your performance."
      contentImage="/images/baseball-training-equipment.webp"
      contentImageAlt="Baseball Training Equipment"
      overviewTitle="Training Options"
      overviewParagraphs={[
        "We offer flexible training options to fit every athlete's schedule and goals. From individual lessons to group sessions, players receive expert instruction in an environment built for growth, focus, and fun.",
        [
          "Private Lessons: One-on-one training focused on personalized skill development.",
          "Group Training: Small-group sessions that emphasize teamwork, competition, and shared learning.",
          "Specialized Pitching & Hitting Programs: Focused sessions for refining mechanics and maximizing performance.",
          "Performance Training: Strength, conditioning, and agility programs for explosive athletic results.",
        ],
        "To learn more or to schedule a session, contact our team or visit our training registration page.",
      ]}
      closingTagline="Commit to the Process. Master the Game."
      closingParagraph="At The Diamond Sports Academy, we're committed to helping every athlete reach their potential through hard work, repetition, and expert coaching. Our training programs combine proven methods, advanced analytics, and a supportive culture that pushes players to improve every day."
      ctaLabel="Start Training Today"
      relatedLinks={[
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Camps", href: "/camps" },
        { label: "Clinics", href: "/clinics" },
        { label: "Speed & Agility", href: "/speed-agility" },
      ]}
    />
  );
}
