import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Baseball & Softball Camps",
  description:
    "Specialized baseball and softball camps at The Diamond Sports Academy in Odenton, MD — multi-day intensive programs throughout the year.",
};

export default function CampsPage() {
  return (
    <ServicePageLayout
      badge="Camps"
      headline="What to Expect from Our Camps"
      heroBg="/images/baseball-training-with-coach.webp"
      heroAlt="Baseball Training With Coach"
      introParagraphs={[
        "At The Diamond Sports Academy, our camps are designed to deliver an immersive, high-energy training experience for players of all levels. Each camp provides a structured mix of instruction, drills, and competition to help athletes refine their skills, build confidence, and enjoy the game in a fun and focused environment.",
        [
          "Professional Coaching: Learn directly from our experienced instructors and former college athletes who bring advanced techniques and real-world experience.",
          "Skill Development: Daily drills focused on hitting, pitching, fielding, base running, and game strategy.",
          "Competition & Team Play: Players are grouped by age and ability to ensure balanced, competitive sessions that reinforce teamwork and communication.",
          "Motivational Environment: Our staff emphasizes sportsmanship, effort, and positive mindset throughout every session.",
        ],
      ]}
      whyTitle="Why Attend a Diamond Sports Camp?"
      whyParagraphs={[
        "Our camps go beyond the fundamentals — they build the complete athlete. With a mix of skill refinement, conditioning, and mental development, every player gains the tools to perform with confidence both on and off the field. Whether preparing for the upcoming season or looking to stand out at tryouts, our camps provide a foundation for long-term success.",
        [
          "Led by passionate instructors with collegiate and coaching backgrounds.",
          "Balanced schedules combining learning, competition, and fun.",
          "Safe, inclusive environment with a strong focus on player growth and teamwork.",
          "Comprehensive instruction across multiple positions and skill sets.",
        ],
      ]}
      whoTitle="Who Can Participate?"
      whoText="Our camps welcome baseball and softball players of all ages and abilities. Whether you're just starting out or competing at a travel, middle school, or high school level, we group participants based on experience to ensure the right mix of challenge and instruction. Every athlete leaves camp with improved mechanics, sharper instincts, and greater love for the game."
      contentImage="/images/baseball-training-with-coach.webp"
      contentImageAlt="Baseball Training With Coach"
      overviewTitle="Upcoming Camps"
      overviewParagraphs={[
        "We host seasonal camps throughout the year designed to match each stage of a player's development. From offseason training to summer showcases, our camps help athletes stay sharp and motivated all year long.",
        [
          "Spring Break Tune-Up Camp: Get ready for the season with drills focused on hitting rhythm, arm strength, and defense.",
          "Summer All-Skills Camp: Our most popular program — a multi-day camp covering every aspect of the game in a competitive, high-energy environment.",
          "Fall Development Camp: Focused training to reinforce good habits and consistency before the offseason.",
          "Winter Elite Camp: Intensive training with advanced drills and small group instruction to refine key skills.",
        ],
        "For upcoming dates, registration details, or questions about age groups, please visit our contact page or call us at (443) 865-1639.",
      ]}
      closingTagline="Train with Passion. Play with Purpose."
      closingParagraph="At The Diamond Sports Academy, we believe that greatness starts with preparation and effort. Our camps are built to motivate athletes to challenge themselves, support one another, and grow into confident players and leaders. With expert guidance and state-of-the-art training facilities, every athlete gains the foundation for success on the field and beyond."
      ctaLabel="Register for a Camp"
      relatedLinks={[
        { label: "Clinics", href: "/clinics" },
        { label: "Training", href: "/training" },
        { label: "1-on-1 Training", href: "/1-on-1-training" },
      ]}
    />
  );
}
