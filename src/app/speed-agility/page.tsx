import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Speed & Agility Training",
  description:
    "Speed and agility training at The Diamond Sports Academy — improve acceleration, reaction time, balance, and coordination with expert coaching.",
};

export default function SpeedAgilityPage() {
  return (
    <ServicePageLayout
      badge="Speed & Agility"
      headline="Develop Explosive Speed and Game-Changing Agility"
      heroBg="/images/speed-training-scaled.webp"
      heroAlt="Speed Training"
      introParagraphs={[
        "Speed and agility are the foundation of every elite athlete's performance — and at The Diamond Sports Academy, our program is designed to unlock both. Each session focuses on improving acceleration, reaction time, balance, and coordination through proven drills that build functional athletic movement.",
        "Under the guidance of experienced instructors, athletes learn how to move with power and precision, gaining the confidence to perform faster and smarter in real-game scenarios. Whether you're sprinting out of the batter's box, tracking down a fly ball, or improving lateral quickness in the field, our training delivers measurable results.",
        [
          "Personalized Drills: Each session adapts to the athlete's sport, age, and skill level.",
          "Half-Hour Sessions: $60 per 30-minute session with focused one-on-one coaching.",
          "Core Training: Strengthen your foundation for better balance, posture, and acceleration.",
          "Professional Equipment: Use cones, ladders, resistance bands, and timers for dynamic improvement.",
        ],
        "Our coaches help athletes understand proper form, movement efficiency, and body control — all key factors in becoming quicker, stronger, and more explosive on the field.",
      ]}
      whyTitle="Why Speed & Agility Training Matters"
      whyParagraphs={[
        "Speed isn't just about running fast — it's about moving efficiently. Our program helps athletes enhance stride mechanics, improve directional change, and maintain explosive motion through every rep. These skills directly translate to performance in baseball, softball, and other competitive sports.",
        [
          "Improves sprint speed, reaction time, and endurance.",
          "Boosts coordination and muscle memory for peak athletic control.",
          "Reduces injury risk by developing stability and flexibility.",
          "Enhances confidence and body awareness in competitive play.",
        ],
        "Our athletes learn to accelerate with purpose, decelerate safely, and react faster — creating a complete player capable of dominating every aspect of the game.",
      ]}
      whoTitle="Who Can Benefit from This Program?"
      whoText="Our Speed & Agility program is open to athletes of all ages and skill levels. From youth players learning how to move efficiently to high school and collegiate athletes looking to maximize speed, every participant receives coaching tailored to their goals. Sessions are structured to challenge each athlete appropriately while maintaining a supportive, competitive environment."
      contentImage="/images/speed-training-scaled.webp"
      contentImageAlt="Speed Training"
      overviewTitle="Program Overview & Scheduling"
      overviewParagraphs={[
        "Each training session lasts 30 minutes and focuses on targeted speed mechanics and controlled agility movements.",
        [
          "Cost: $60 per 30-minute session",
          "Focus Areas: Acceleration, balance, lateral movement, and reaction training",
          "Equipment: Agility ladders, cones, bands, hurdles, and resistance training tools",
          "Availability: Year-round scheduling for individuals or small groups",
        ],
        "Consistency is key — most athletes train one to two times per week for steady, long-term improvement.",
      ]}
      closingTagline="Train Faster. Move Smarter. Play Better."
      closingParagraph="At The Diamond Sports Academy, we help athletes turn raw ability into refined performance. Our Speed & Agility sessions develop the precision and control that separate good players from great ones. If you're ready to improve your quickness, coordination, and explosive movement — this is where it starts."
      ctaLabel="Start Speed Training"
      relatedLinks={[
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Weight Training", href: "/weight-training" },
        { label: "Technology Tunnels", href: "/technology-tunnels" },
        { label: "Memberships", href: "/memberships" },
      ]}
    />
  );
}
