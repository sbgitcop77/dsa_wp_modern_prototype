import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Technology Tunnels",
  description:
    "Train smarter with HitTrax and Rapsodo technology tunnels at The Diamond Sports Academy. Real-time metrics for hitters and pitchers.",
};

export default function TechTunnelsPage() {
  return (
    <ServicePageLayout
      badge="Technology Tunnels"
      headline="Train Smarter with Advanced Technology"
      heroBg="/images/baseball-training-facility-and-equipment-sq.webp"
      heroAlt="Baseball Training Facility and Equipment"
      introParagraphs={[
        "At The Diamond Sports Academy, we use cutting-edge technology to help athletes understand their performance like never before. Our HitTrax and Rapsodo tunnels provide instant feedback on every swing and pitch — allowing players to analyze results, make quick adjustments, and track measurable progress over time.",
        "These data-driven training tools help bridge the gap between practice and performance. Whether you're looking to add power to your swing or refine your pitching mechanics, our technology tunnels provide the insights you need to elevate your game.",
        [
          "HitTrax Tunnel: $60 per hour | $40 per half hour",
          "Rapsodo Tunnel: $60 per hour | $40 per half hour",
          "Instant Feedback: Real-time metrics for immediate improvement",
          "Video Analysis: Review performance with precision and clarity",
        ],
        "Every session is designed to deliver more than just reps — it gives athletes the knowledge and confidence to perform at their best on game day.",
      ]}
      whyTitle="Why Train with HitTrax and Rapsodo?"
      whyParagraphs={[
        "Technology has revolutionized player development, and our facility puts it directly in your hands. These systems measure and analyze performance metrics that go beyond what the eye can see, helping athletes fine-tune every detail of their mechanics.",
        [
          "HitTrax: Tracks exit velocity, launch angle, distance, and spray charts for hitters",
          "Rapsodo: Measures spin rate, pitch movement, and velocity for pitchers",
          "Visualizes improvement through video and data overlays",
          "Provides instant feedback to correct inefficiencies in real-time",
        ],
        "By pairing data with professional instruction, players develop a deeper understanding of their strengths and areas for growth — leading to smarter, more efficient training sessions.",
      ]}
      whoTitle="Who Should Use the Technology Tunnels?"
      whoText="Our technology tunnels are ideal for players of all skill levels who want to take a more analytical approach to training. Whether you're a youth athlete learning the fundamentals or a college player preparing for competition, these systems help refine every aspect of your performance. Coaches and teams can also reserve the tunnels to gather data for player evaluations, lineup decisions, or showcase preparation — making it an invaluable resource for long-term development."
      contentImage="/images/indoor-training-facility.webp"
      contentImageAlt="Indoor Training Facility"
      overviewTitle="Session Details and Booking Options"
      overviewParagraphs={[
        "Our HitTrax and Rapsodo sessions are flexible and easy to book, allowing players to train individually or in small groups.",
        [
          "HitTrax Tunnel: $60 per hour | $40 per half hour",
          "Rapsodo Tunnel: $60 per hour | $40 per half hour",
          "Booking Options: Single sessions or recurring time slots available",
          "Environment: Climate-controlled, well-lit, and optimized for feedback analysis",
        ],
        "Each session includes setup assistance, calibration, and access to our staff for technical guidance and interpretation of data.",
      ]}
      closingTagline="Elevate Your Training with Data-Driven Results"
      closingParagraph="When it comes to player development, numbers don't lie. At The Diamond Sports Academy, our HitTrax and Rapsodo tunnels turn data into actionable insights that accelerate progress and boost confidence. Train like a pro, track your metrics, and take your performance to the next level."
      ctaLabel="Book a Session"
      relatedLinks={[
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Team Facility Rentals", href: "/team-facility-rentals" },
        { label: "Memberships", href: "/memberships" },
        { label: "Speed & Agility", href: "/speed-agility" },
      ]}
    />
  );
}
