import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Golf Simulator",
  description:
    "Indoor golf simulator at The Diamond Sports Academy — play world-class courses, track your swing data, and improve year-round.",
};

export default function GolfSimulatorPage() {
  return (
    <ServicePageLayout
      badge="Golf Simulator"
      headline="Experience Real-Course Play with Our Golf Simulator"
      heroBg="/images/golf-simulator.webp"
      heroAlt="Golf Simulator"
      introParagraphs={[
        "At The Diamond Sports Academy, our state-of-the-art golf simulator lets players experience the challenge and excitement of playing on world-class courses — no matter the weather. Whether you're fine-tuning your swing or playing a full round with friends, our simulator delivers realistic ball flight data, high-definition visuals, and instant feedback to help improve your game.",
        [
          "Hourly Rental: $40 per hour",
          "Half-Hour Session: $30 per half hour",
          "Full 18 Holes: $55 (any course)",
        ],
        "Perfect for golfers of all skill levels, our simulator provides a fun and focused way to practice, compete, and enjoy the game year-round.",
      ]}
      whyTitle="Why Train with a Golf Simulator?"
      whyParagraphs={[
        "Our golf simulator combines technology and performance tracking to help players improve swing mechanics, shot accuracy, and course management skills. It's ideal for practice, private lessons, or friendly competition.",
        [
          "Play on virtual replicas of top golf courses from around the world.",
          "Track swing speed, ball spin, distance, and launch angle in real time.",
          "Work on specific skills — from putting and approach shots to drives.",
          "Enjoy a private, climate-controlled environment for year-round play.",
        ],
        "Whether you're a beginner learning fundamentals or an experienced golfer perfecting your form, our simulator helps you analyze and refine every shot.",
      ]}
      whoTitle="Who Can Use the Golf Simulator?"
      whoText="Our simulator is open to athletes, families, and golfers of all levels. Players can rent the simulator individually, bring a friend for a shared session, or schedule small-group play. It's also great for baseball and softball players looking to cross-train, improve hand-eye coordination, or just enjoy a fun competitive experience."
      overviewTitle="Booking & Availability"
      overviewParagraphs={[
        "The golf simulator is available for booking throughout the week and can be reserved by the half hour, full hour, or full round (18 holes).",
        [
          "Reserve online or by phone for your preferred time slot.",
          "Walk-ins welcome based on availability.",
          "Discounts available for Diamond Academy members.",
        ],
        "Bring your clubs or use our in-house equipment — either way, you'll experience a true-to-life round of golf in a comfortable indoor setting.",
      ]}
      closingTagline="Play, Practice, and Improve"
      closingParagraph="At The Diamond Sports Academy, our golf simulator offers a perfect blend of technology and fun. Whether you're practicing solo or competing with friends, it's a great way to refine your skills and enjoy the game year-round."
      ctaLabel="Book Your Tee Time"
      relatedLinks={[
        { label: "Technology Tunnels", href: "/technology-tunnels" },
        { label: "Memberships", href: "/memberships" },
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Team Facility Rentals", href: "/team-facility-rentals" },
      ]}
    />
  );
}
