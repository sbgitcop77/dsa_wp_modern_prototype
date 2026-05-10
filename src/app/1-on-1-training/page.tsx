import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "1-on-1 Training",
  description:
    "Private 1-on-1 baseball and softball training at The Diamond Sports Academy — personalized hitting, pitching, fielding, and catching instruction.",
};

export default function OneOnOneTrainingPage() {
  return (
    <ServicePageLayout
      badge="1-on-1 Training"
      headline="Personalized Skill Development for Every Athlete"
      heroBg="/images/baseball-training-with-coach.webp"
      heroAlt="Baseball Training With Coach"
      introParagraphs={[
        "At The Diamond Sports Academy, our 1-on-1 training programs give players the focused attention they need to reach the next level. Each private session is designed around the athlete's individual goals — whether it's improving swing mechanics, increasing throwing velocity, or mastering defensive fundamentals.",
        [
          "Hitting Instruction: Refine your swing, improve timing, and increase exit velocity with advanced drills and real-time feedback.",
          "Pitching Mechanics: Develop control, command, and velocity while learning proper arm care and balance techniques.",
          "Fielding Fundamentals: Build confidence in footwork, glove work, and quick transitions to elevate defensive performance.",
          "Catching Technique: Improve receiving, blocking, and pop time through dedicated, position-specific instruction.",
        ],
        "Each private lesson is $60 per half hour and led by experienced instructors who bring real playing and coaching experience to every session.",
      ]}
      whyTitle="Why Choose Private Training at The Diamond?"
      whyParagraphs={[
        "Private lessons offer an unmatched opportunity for focused improvement and rapid skill progression. Our instructors tailor every session to the player's ability level and goals, helping athletes make measurable progress in a short period of time.",
        [
          "One-on-one coaching with professional instructors.",
          "Immediate feedback and video analysis to correct form.",
          "Sessions that build consistency, power, and confidence.",
          "Training that complements team practices and game performance.",
        ],
        "Whether you're a youth player building fundamentals or a high school athlete preparing for competition, our individual instruction will help you perform at your peak.",
      ]}
      whoTitle="Who Benefits Most from 1-on-1 Training?"
      whoText="Our personalized training programs are ideal for athletes who want to sharpen specific skills or receive extra attention outside of team practices. Sessions are open to baseball and softball players of all ages and experience levels, and each lesson is customized to match the player's current skill set and objectives."
      contentImage="/images/baseball-training-with-coach.webp"
      contentImageAlt="Baseball Training With Coach"
      overviewTitle="Available 1-on-1 Training Sessions"
      overviewParagraphs={[
        "We offer flexible scheduling throughout the week, allowing athletes and families to train at times that work best for them. Lessons can be booked for hitting, pitching, fielding, or catching — or combined for comprehensive skill development.",
        [
          "1-on-1 Hitting, Pitching, Fielding, or Catching: $60 per half hour",
          "Speed & Agility Training: $60 per half hour",
          "Weight Training with a Personal Trainer: $60 per hour (3–4 athletes per group)",
        ],
        "Training sessions can be customized to your schedule and skill level. Contact us to reserve your preferred time.",
      ]}
      closingTagline="Train with Purpose and Confidence"
      closingParagraph="Every athlete deserves individualized attention and professional guidance. At The Diamond Sports Academy, our 1-on-1 lessons help players build skills, discipline, and mental strength to succeed on and off the field."
      ctaLabel="Book a Private Lesson"
      relatedLinks={[
        { label: "Speed & Agility", href: "/speed-agility" },
        { label: "Weight Training", href: "/weight-training" },
        { label: "Technology Tunnels", href: "/technology-tunnels" },
        { label: "Memberships", href: "/memberships" },
      ]}
    />
  );
}
