import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about The Diamond Sports Academy — our history, mission, values, and the coaching staff helping athletes reach their potential since 2022.",
};

export default function AboutPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative h-72 lg:h-96 flex items-center">
        <Image
          src="/images/baseball-training-facility-and-equipment-sq.webp"
          alt="Training Facility"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00141B]/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Who We Are</h1>
        </div>
      </section>

      {/* About intro */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-5">
                Pushing Boundaries, Building Champions
              </h2>
              <p className="text-[#6c757d] leading-relaxed mb-6">
                At The Diamond Sports Academy, we combine professional instruction, cutting-edge technology, and a positive training culture to prepare athletes for competitive success — on and off the field.
              </p>
              <p className="text-[#6c757d] leading-relaxed mb-4">
                Founded in 2022, we&apos;ve grown into a premier destination for baseball and softball training in the Odenton, MD area — serving over 150 active athletes with a coaching staff that brings collegiate and professional experience to every session.
              </p>
              <p className="text-[#6c757d] leading-relaxed mb-8">
                We help athletes develop power, precision, and confidence through structured training, proven techniques, and one-on-one mentorship.
              </p>
              <a
                href="/training"
                className="inline-block bg-[#337C99] hover:bg-[#265d73] text-white font-semibold px-7 py-3.5 rounded transition-colors mb-8"
              >
                Enroll in Our Programs
              </a>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { num: "150+", label: "Active Athletes" },
                  { num: "300+", label: "Program Graduates" },
                  { num: "10+", label: "Expert Coaches" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F7F7F7] border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#337C99] mb-1">{s.num}</p>
                    <p className="text-[#6c757d] text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden h-64">
                <Image
                  src="/images/indoor-weight-training-facility.webp"
                  alt="Indoor Weight Training Facility"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-xl overflow-hidden h-40">
                  <Image
                    src="/images/baseball-training-facility-and-equipment-sq.webp"
                    alt="Baseball Training Facility"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative rounded-xl overflow-hidden h-40">
                  <Image
                    src="/images/baseball-in-field.webp"
                    alt="Baseball In Field"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Development + Performance */}
      <section className="bg-[#F7F7F7] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
              Sharpen Your Skills and Elevate Your Game
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="w-10 h-0.5 bg-[#337C99] mb-5" />
              <h3 className="text-xl font-bold text-[#212529] mb-3">Player Development</h3>
              <p className="text-[#6c757d] leading-relaxed">
                Focused skill progression through individualized instruction and data-driven training. We meet athletes where they are and build a clear path to their goals — whether that&apos;s making the varsity squad, earning a scholarship, or simply falling in love with the game.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="w-10 h-0.5 bg-[#337C99] mb-5" />
              <h3 className="text-xl font-bold text-[#212529] mb-3">Performance Excellence</h3>
              <p className="text-[#6c757d] leading-relaxed">
                Combining advanced analytics, strength programs, and mentorship to maximize performance. From swing mechanics to arm strength to base running — every facet of the game is addressed with purpose and measurable outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#212529]">
              What Makes The Diamond Sports Academy Different
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Collegiate-Level Staff", desc: "Our coaches bring Division I and professional backgrounds to every session." },
              { title: "Small Group Focus", desc: "We cap our sessions to keep coaching personal and instruction effective." },
              { title: "HitTrax & Rapsodo", desc: "Real-time data on every swing and pitch to track and drive improvement." },
              { title: "Full Facility", desc: "Turf lanes, weight room, tech tunnels — everything in one location." },
            ].map((f) => (
              <div key={f.title} className="bg-[#F7F7F7] border border-gray-200 rounded-xl p-6">
                <div className="w-8 h-0.5 bg-[#337C99] mb-4" />
                <h3 className="text-[#212529] font-semibold mb-2">{f.title}</h3>
                <p className="text-[#6c757d] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About sub-nav */}
      <section className="bg-[#F7F7F7] py-14 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#212529] text-center mb-8">Explore More About Us</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Our Facility", href: "/our-facility" },
              { label: "Our Coaches", href: "/our-coaches" },
              { label: "Our Recruits", href: "/recruits" },
              { label: "Our Alumni", href: "/our-alumni" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border border-gray-300 hover:border-[#337C99] text-[#6c757d] hover:text-[#337C99] px-6 py-3 rounded transition-colors font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <CtaBanner />
    </>
  );
}
