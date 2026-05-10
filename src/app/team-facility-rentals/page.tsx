import type { Metadata } from "next";
import ServicePageLayout from "@/components/ServicePageLayout";

export const metadata: Metadata = {
  title: "Team Facility Rentals",
  description:
    "Rent The Diamond Sports Academy for team practices — indoor baseball and softball facility with hitting tunnels, turf, and HitTrax/Rapsodo technology.",
};

export default function TeamFacilityRentalsPage() {
  return (
    <ServicePageLayout
      badge="Team Facility Rentals"
      headline="Train Together in a Professional-Grade Facility"
      heroBg="/images/baseball-batting-equipment-and-net-cage-sq.webp"
      heroAlt="Baseball Batting Equipment and Net Cage"
      introParagraphs={[
        "At The Diamond Sports Academy, we understand that championship-level teams need space, structure, and consistency to train effectively. Our facility was built with that in mind — offering teams a clean, climate-controlled environment equipped for high-intensity practices, skill development, and game simulation.",
        "From hitting tunnels to pitching mounds and open turf space, every area of our facility is designed to help players maximize their performance. Coaches can easily run full-team workouts, defensive rotations, and individual drills without interruptions or weather delays. We also provide access to professional training equipment and technology to help track progress and enhance player development.",
        [
          "2-Lane Rental: $160 per hour",
          "Full Facility Rental: $220 per hour",
        ],
        "Whether you're preparing for a new season, hosting private team sessions, or conducting off-season training, The Diamond Sports Academy provides the space and resources you need to elevate your program. Our staff is here to help you organize your time efficiently and ensure every athlete leaves better than they came.",
      ]}
      whyTitle="Why Choose The Diamond for Team Rentals?"
      whyParagraphs={[
        "Our facility is built for serious player development and teamwork. From hitting tunnels to open turf areas, teams can run full practices, position-specific drills, and live-action reps without weather interruptions.",
        [
          "Access to multiple training areas and lanes.",
          "Convenient scheduling options for recurring sessions.",
          "High-quality lighting, turf, and equipment for professional-level practice.",
          "Perfect for baseball, softball, and multi-sport training groups.",
        ],
        "Our goal is to give coaches the space, tools, and freedom to focus on developing their players — while we provide the environment to make it happen.",
      ]}
      whoTitle="Who Can Rent the Facility?"
      whoText="Our rentals are available for teams, clubs, and small training groups throughout the year. From youth travel ball programs to high school and collegiate teams, The Diamond Sports Academy welcomes all organizations seeking a clean, professional, and fully equipped training space."
      contentImage="/images/baseball-batting-equipment-and-net-cage-sq.webp"
      contentImageAlt="Baseball Batting Equipment and Net Cage"
      overviewTitle="Facility Features & Booking Options"
      overviewParagraphs={[
        "The Diamond Sports Academy offers a flexible layout designed to accommodate a variety of training needs.",
        [
          "2-Lane Rental — $160/hour",
          "Full Facility Rental — $220/hour",
          "Rapsodo & HitTrax Technology Available",
          "Private Restrooms, Lounge Area, and On-Site Equipment",
        ],
        "Rental times are available throughout the week and can be customized for single practices or ongoing sessions. Contact us to confirm availability and reserve your spot.",
      ]}
      closingTagline="Train Smarter. Together."
      closingParagraph="Bring your team to The Diamond Sports Academy and experience an indoor training space built for serious athletes. With flexible booking, professional-grade equipment, and a supportive environment, your next great season starts here."
      ctaLabel="Book Facility"
      relatedLinks={[
        { label: "Technology Tunnels", href: "/technology-tunnels" },
        { label: "Memberships", href: "/memberships" },
        { label: "1-on-1 Training", href: "/1-on-1-training" },
        { label: "Camps", href: "/camps" },
      ]}
    />
  );
}
