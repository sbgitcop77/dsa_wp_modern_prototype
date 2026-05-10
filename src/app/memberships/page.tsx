import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Memberships",
  description:
    "Monthly membership plans at The Diamond Sports Academy — player and parent options for unlimited facility access, training equipment, and more.",
};

export default function MembershipsPage() {
  return (
    <ServicePageLayout
      badge="Memberships"
      headline="Train Year-Round with a Diamond Sports Academy Membership"
      heroBg="/images/batting-baseball-scaled.webp"
      heroAlt="Batting Baseball"
      introParagraphs={[
        "Becoming a member at The Diamond Sports Academy gives players and families full access to our professional-grade facility all year long. Memberships are designed for athletes who want the freedom to train when they want, how they want — without the constraints of session scheduling or team bookings.",
        "Members gain access to our batting cages, pitching lanes, turf areas, and weight room during designated hours, creating an environment that supports growth, consistency, and accountability. Whether you're fine-tuning your swing, perfecting your throw, or working on overall athletic strength, a Diamond membership keeps you game-ready every season.",
        [
          "Player Membership: $80/month — full facility access for individual training",
          "Parent Membership: $20/month — access for supervision and participation support",
        ],
        "Train independently or alongside teammates at your own pace. Includes access to seasonal discounts and exclusive member-only programs.",
        "Our memberships are flexible, affordable, and perfect for dedicated athletes committed to long-term development.",
      ]}
      whyTitle="Why Become a Member?"
      whyParagraphs={[
        "Consistent training leads to consistent results — and our memberships are built for athletes who take their craft seriously. By joining The Diamond Sports Academy, you're not just renting space; you're investing in your future performance.",
        [
          "Train year-round in a climate-controlled, professional environment",
          "Access to top-tier training tools, tunnels, and weight equipment",
          "Member-exclusive hours for uninterrupted workouts",
          "Build discipline, confidence, and accountability",
        ],
      ]}
      whoTitle="Who Can Join?"
      whoText="Memberships are open to baseball and softball players of all ages, as well as parents who wish to accompany their athletes during practice sessions. From young athletes developing fundamentals to experienced players preparing for competition, our flexible membership options allow everyone to train in a supportive, high-quality facility."
      contentImage="/images/indoor-training-facility.webp"
      contentImageAlt="Indoor Training Facility"
      overviewTitle="What's Included in a Membership?"
      overviewParagraphs={[
        "When you join The Diamond Sports Academy, you gain access to everything needed to build a complete athlete. Members enjoy a seamless experience designed to make every visit productive, convenient, and motivating.",
        [
          "Unlimited access to hitting tunnels, pitching lanes, and turf space",
          "Use of weight training equipment and conditioning area",
          "Discounted rates on clinics, private lessons, and technology tunnels",
          "Early registration access for camps and seasonal programs",
        ],
      ]}
      closingTagline="Join the Diamond Family Today"
      closingParagraph="Memberships at The Diamond Sports Academy are more than a pass to train — they're a commitment to excellence. Our facility is a space where passion, progress, and community come together to help athletes reach their full potential. Take control of your training schedule, access elite resources, and join a community that's dedicated to developing champions."
      ctaLabel="Become a Member"
      relatedLinks={[
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Technology Tunnels", href: "/technology-tunnels" },
        { label: "Team Facility Rentals", href: "/team-facility-rentals" },
        { label: "Camps", href: "/camps" },
      ]}
    />
  );
}
