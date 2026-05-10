import type { Metadata } from "next";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Our Facility",
  description:
    "State-of-the-art training facility in Odenton, MD with batting tunnels, HitTrax, Rapsodo, indoor turf, weight room, and more.",
};

export default function FacilityPage() {
  return (
    <>
      {/* Header */}
      <section className="relative h-80 lg:h-[500px] flex items-center">
        <Image
          src="/images/the-diamond-sports-academy-facility.webp"
          alt="The Diamond Sports Academy Facility"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00141B]/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Our Facility</p>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Where Training Meets Innovation
          </h1>
          <p className="text-white/70 text-lg max-w-xl mb-8">
            A state-of-the-art training environment designed to help athletes achieve peak performance year-round.
          </p>
          <a
            href="/contact-us"
            className="inline-block bg-[#f33b41] hover:bg-[#d62f35] text-white font-semibold px-7 py-3.5 rounded transition-colors"
          >
            Schedule a Visit
          </a>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Facility Highlights</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#212529]">Designed for Every Athlete</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                title: "Batting & Pitching Tunnels",
                desc: "Multiple full-length tunnels equipped with HitTrax and Rapsodo technology for data-driven practice.",
              },
              {
                title: "Indoor Turf Space",
                desc: "Spacious indoor turf for team practices, defensive drills, agility training, and warm-ups.",
              },
              {
                title: "Strength & Conditioning",
                desc: "Dedicated weight room with professional-grade equipment and certified personal trainers.",
              },
              {
                title: "Year-Round Training",
                desc: "Temperature-controlled environment so athletes can train at peak performance in any season.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#F7F7F7] border border-gray-200 rounded-xl p-6">
                <div className="w-8 h-0.5 bg-[#337C99] mb-4" />
                <h3 className="text-[#212529] font-semibold mb-2">{f.title}</h3>
                <p className="text-[#6c757d] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Image gallery */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative rounded-xl overflow-hidden h-56">
              <Image src="/images/baseball-batting-equipment-and-net-cage-sq.webp" alt="Batting Cage" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="relative rounded-xl overflow-hidden h-56">
              <Image src="/images/indoor-training-facility.webp" alt="Indoor Training Facility" fill className="object-cover" sizes="33vw" />
            </div>
            <div className="relative rounded-xl overflow-hidden h-56">
              <Image src="/images/indoor-weight-training-facility.webp" alt="Weight Training Facility" fill className="object-cover" sizes="33vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Technology section */}
      <section className="bg-[#F7F7F7] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Training Technology</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-5">Where Data Drives Development</h2>
              <p className="text-[#6c757d] leading-relaxed mb-8">
                We integrate advanced analytics tools that give athletes and coaches real-time feedback to accelerate learning and track measurable progress.
              </p>

              <div className="space-y-5">
                {[
                  { tool: "HitTrax", desc: "Real-time exit velocity, launch angle, and spray chart data on every swing." },
                  { tool: "Rapsodo", desc: "Pitch speed, spin rate, break, and movement metrics for pitchers and hitters." },
                  { tool: "High-Speed Video", desc: "Frame-by-frame swing and pitching analysis to identify and correct mechanics." },
                ].map((t) => (
                  <div key={t.tool} className="flex gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#337C99] mt-2" />
                    <div>
                      <h3 className="text-[#212529] font-semibold">{t.tool}</h3>
                      <p className="text-[#6c757d] text-sm mt-1">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden h-80 lg:h-[460px]">
              <Image
                src="/images/baseball-training-facility-and-equipment-sq.webp"
                alt="Training Technology"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <CtaBanner />
    </>
  );
}
