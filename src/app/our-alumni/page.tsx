import type { Metadata } from "next";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Our Alumni",
  description:
    "Meet The Diamond Sports Academy alumni who have gone on to compete at the collegiate and professional level.",
};

const ALUMNI = [
  {
    name: "Jordan Lee",
    position: "Outfielder / Center Field",
    classYear: "2021",
    bio: "A two-sport athlete whose speed and agility training at The Diamond enabled his transition to Division I athletics. Known for his base-stealing ability and elite defensive coverage in center field.",
  },
  {
    name: "Caleb Harris",
    position: "Shortstop / Second Base",
    classYear: "2024",
    bio: "Trained at The Diamond for 5+ years, refining his defensive range and hitting mechanics. Currently a starting infielder on FSU's freshman roster after earning a scholarship out of high school.",
  },
  {
    name: "Maya Thompson",
    position: "Catcher / Utility",
    classYear: "2022",
    bio: "The first Diamond athlete to earn a full athletic scholarship. Recognized for her leadership behind the plate and exceptional defensive awareness, Maya set the standard for what the program could achieve.",
  },
  {
    name: "Ethan Rodriguez",
    position: "Pitcher (RHP)",
    classYear: "2023",
    bio: "A standout known for his control and fastball velocity development. Helped lead his high school team to the state semifinals in 2023 before earning a collegiate roster spot the following year.",
  },
];

export default function AlumniPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#00141B] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Alumni</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Athletes who trained at The Diamond Sports Academy and went on to compete at higher levels.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Program Alumni</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-4">From The Diamond to the Next Level</h2>
          <p className="text-[#6c757d] text-lg max-w-3xl leading-relaxed">
            The Diamond Sports Academy is proud to recognize athletes who have trained with us and advanced their careers at the collegiate and professional levels. These alumni represent the dedication, discipline, and drive that define our program.
          </p>
        </div>
      </section>

      {/* Alumni grid */}
      <section className="bg-[#F7F7F7] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {ALUMNI.map((a) => (
              <div key={a.name} className="bg-white border border-gray-200 rounded-xl p-7 flex gap-6 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src="/images/placeholder-diamond-team-member.webp"
                      alt={a.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[#f33b41] text-xs font-semibold uppercase tracking-widest mb-1">Class of {a.classYear}</p>
                  <h2 className="text-[#212529] font-bold text-xl mb-0.5">{a.name}</h2>
                  <p className="text-[#337C99] text-sm font-semibold mb-3">{a.position}</p>
                  <p className="text-[#6c757d] text-sm leading-relaxed">{a.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <CtaBanner />
    </>
  );
}
