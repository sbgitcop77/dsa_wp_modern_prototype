import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Weight Training",
  description:
    "Strength and conditioning at The Diamond Sports Academy — guided weight training for baseball and softball athletes of all ages.",
};

export default function WeightTrainingPage() {
  return (
    <ServicePageLayout
      badge="Weight Training"
      headline="Strength Training Designed for Serious Athletes"
      heroBg="/images/weights-on-rack.webp"
      heroAlt="Weights on Rack"
      introParagraphs={[
        "At The Diamond Sports Academy, our weight training program builds the strength, speed, and endurance athletes need to perform their best. Every workout is customized to your sport, position, and personal goals, helping you gain a competitive edge through proper technique and guided progression.",
        [
          "Professional Coaching: Work directly with certified trainers who understand the demands of baseball, softball, and athletic performance.",
          "Functional Strength: Improve mobility, coordination, and explosiveness with movements built for in-game results.",
          "Group Sessions: Train alongside 3–4 athletes to stay motivated while receiving individualized attention.",
          "Personal Training Rate: $60 per hour, per person.",
        ],
        "Our trainers focus on building a strong foundation — physically and mentally — so every athlete can play harder, faster, and longer.",
      ]}
      whyTitle="Why Weight Training Matters for Athletes"
      whyParagraphs={[
        "Proper strength training improves every aspect of athletic performance. From throwing velocity to bat speed, balance, and reaction time, a well-structured program can transform how you move and compete.",
        [
          "Increases power, stability, and body control.",
          "Reduces the risk of overuse and impact-related injuries.",
          "Improves coordination and explosiveness for game-time performance.",
          "Supports faster recovery and better overall conditioning.",
        ],
        "Every session is guided by professionals who ensure correct form, steady progression, and goal-based training for long-term results.",
      ]}
      whoTitle="Who Can Join the Weight Training Program?"
      whoText="Our strength and conditioning sessions are open to athletes ages 10 and up — from youth players developing fundamentals to high school and college athletes preparing for competitive seasons. Each program is customized to your skill level, position, and physical readiness, ensuring safe and effective growth over time."
      contentImage="/images/indoor-weight-training-facility.webp"
      contentImageAlt="Indoor Weight Training Facility"
      overviewTitle="Program Details & Scheduling"
      overviewParagraphs={[
        "Training sessions are available year-round and can be scheduled for individuals or small groups.",
        [
          "1-Hour Session with Personal Trainer — $60 per person",
          "3–4 Athlete Group Sessions Available",
          "Focus Areas: Strength, Agility, Power, and Recovery",
        ],
        "We encourage consistent training to maximize results. Sessions can be scheduled weekly or integrated with your current training plan.",
      ]}
      closingTagline="Build Power. Build Confidence. Build Your Game."
      closingParagraph="At The Diamond Sports Academy, our weight training program helps athletes transform potential into performance. With expert coaching, structured workouts, and a motivating team environment, every session brings you one step closer to your goals."
      ctaLabel="Start Weight Training"
      relatedLinks={[
        { label: "Speed & Agility", href: "/speed-agility" },
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Memberships", href: "/memberships" },
        { label: "Technology Tunnels", href: "/technology-tunnels" },
      ]}
    />
  );
}
