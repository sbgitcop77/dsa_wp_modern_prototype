import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Clinics",
  description:
    "Focused baseball and softball clinics at The Diamond Sports Academy — group instruction on hitting, pitching, fielding, speed, and game awareness.",
};

export default function ClinicsPage() {
  return (
    <ServicePageLayout
      badge="Clinics"
      headline="What to Expect from Our Clinics"
      heroBg="/images/baseball-player-scaled.webp"
      heroAlt="Baseball Player"
      introParagraphs={[
        "Each clinic at The Diamond Sports Academy is designed to help players reach the next level — whether they're mastering fundamentals or perfecting advanced techniques. Our sessions combine expert coaching, small group training, and game-simulated drills that promote real progress in a competitive yet encouraging environment.",
        [
          "Hitting Mechanics: Improve consistency, balance, and power through personalized instruction and data-driven feedback.",
          "Pitching & Throwing: Build arm strength, accuracy, and control while learning proper recovery and form.",
          "Fielding & Defense: Develop quick reflexes, clean transitions, and confident glove work.",
          "Speed & Agility: Increase explosiveness, reaction time, and coordination using proven athletic drills.",
          "Game Awareness: Strengthen your baseball IQ through situational training and decision-making exercises.",
        ],
      ]}
      whyTitle="Why Join a Clinic at The Diamond?"
      whyParagraphs={[
        "Our clinics are a cornerstone of player development at The Diamond Sports Academy. They give athletes an opportunity to train in a focused, structured environment with guidance from experienced coaches who know what it takes to compete at higher levels. Whether preparing for tryouts, improving in the offseason, or developing all-around performance, our clinics deliver results.",
        [
          "Led by collegiate-level instructors and former competitive athletes.",
          "Structured group sizes ensure individual attention and feedback.",
          "Sessions emphasize player confidence, consistency, and discipline.",
          "Seasonal programs available for both baseball and softball players.",
        ],
      ]}
      whoTitle="Who Can Participate?"
      whoText="Our clinics are open to baseball and softball players of all ages and experience levels. Whether your athlete is just starting out or already competing at a travel or high school level, we tailor instruction to match each player's goals and abilities. Younger players focus on core mechanics and athletic development, while older athletes refine technique, power, and game-day mentality. Every session is designed to build confidence and help each athlete leave the field better than they arrived."
      contentImage="/images/baseball-player-scaled.webp"
      contentImageAlt="Baseball Player"
      overviewTitle="Upcoming Clinics"
      overviewParagraphs={[
        "We host clinics throughout the year to provide consistent growth opportunities for athletes during every season. Keep an eye on our calendar or contact our team to reserve your spot early — space is limited!",
        [
          "Winter Training Series: Offseason strength, hitting, and pitching fundamentals.",
          "Spring Tune-Up Clinics: Preseason preparation focusing on timing and fielding.",
          "Summer Development Camps: Multi-day training experiences to maximize player improvement.",
          "Fall Showcase Prep: Designed for athletes preparing for collegiate-level evaluations.",
        ],
        "For details on dates, times, and registration, visit our contact page.",
      ]}
      closingTagline="Train with Confidence"
      closingParagraph="At The Diamond Sports Academy, our goal is to create an environment that inspires excellence both on and off the field. Every clinic blends professional instruction, mentorship, and measurable results — empowering athletes to perform their best and love the game more each time they play. Join our growing community of dedicated players and coaches who believe in the power of hard work, preparation, and team-first mentality. Your next level starts here."
      ctaLabel="Register for a Clinic"
      relatedLinks={[
        { label: "Camps", href: "/camps" },
        { label: "Training", href: "/training" },
        { label: "1-on-1 Training", href: "/1-on-1-training" },
      ]}
    />
  );
}
