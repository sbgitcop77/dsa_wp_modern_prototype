import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Isaiah Thompson — Class of 2025 | Recruits",
  description:
    "Isaiah Thompson — RHP/1B, Class of 2025. 87 mph pitch velo, 95 mph exit velo. Training at The Diamond Sports Academy in Odenton, MD.",
};

const STATS = [
  { label: "Exit Velo", value: "95 mph" },
  { label: "Throw Velo", value: "88 mph" },
  { label: "Pitch Velo", value: "87 mph" },
  { label: "60-Yard Dash", value: "7.32 sec" },
  { label: "Vertical Jump", value: "29 in" },
  { label: "Broad Jump", value: "109 in" },
];

export default function IsaiahThompsonPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#00141B] pt-20 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/recruits" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recruits
          </Link>

          <div className="grid lg:grid-cols-3 gap-10 items-end">
            <div className="lg:col-span-2 pb-12">
              <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Class of 2025</p>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-3">Isaiah Thompson</h1>
              <p className="text-white/70 text-xl mb-6">Pitcher (RHP) / First Base &nbsp;·&nbsp; Bats R / Throws R</p>
              <div className="flex flex-wrap gap-4 text-white/60 text-sm">
                <span>5&apos;7&quot;</span>
                <span className="text-white/20">|</span>
                <span>156 lbs</span>
                <span className="text-white/20">|</span>
                <span>The Diamond Sports Academy</span>
              </div>
            </div>
            <div className="relative h-80 lg:h-96 rounded-t-xl overflow-hidden">
              <Image
                src="/images/isaiah-thompson.webp"
                alt="Isaiah Thompson"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 33vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0e2730] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#212529] mb-5">Player Overview</h2>
              <p className="text-[#6c757d] leading-relaxed text-lg">
                Isaiah is a physical right-hander with a downhill fastball and a sharp slider. At the plate, he shows big, projectable power with a heavy barrel and consistent hard contact.
              </p>

              {/* Stats grid */}
              <div className="mt-10">
                <h3 className="text-lg font-bold text-[#212529] mb-4">Performance Metrics</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex items-center justify-between bg-[#F7F7F7] border border-gray-200 rounded-lg px-5 py-3">
                      <span className="text-[#6c757d] text-sm">{s.label}</span>
                      <span className="text-[#212529] font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div>
              <div className="bg-[#F7F7F7] border border-gray-200 rounded-xl p-6 sticky top-24">
                <h3 className="text-[#212529] font-bold text-lg mb-4">Recruit Contact Info</h3>
                <p className="text-[#6c757d] text-sm leading-relaxed mb-5">
                  For recruiting inquiries about Isaiah Thompson, please contact The Diamond Sports Academy directly.
                </p>
                <div className="space-y-3 text-sm text-[#6c757d] mb-6">
                  <p><span className="font-semibold text-[#212529]">Academy:</span> The Diamond Sports Academy</p>
                  <p><span className="font-semibold text-[#212529]">Location:</span> 8274 Lokus Rd, Odenton, MD 21113</p>
                  <p><span className="font-semibold text-[#212529]">Phone:</span> <a href="tel:+14438651639" className="text-[#337C99] hover:underline">(443) 865-1639</a></p>
                </div>
                <Link
                  href="/contact-us"
                  className="block w-full bg-[#f33b41] hover:bg-[#d62f35] text-white font-semibold px-6 py-3 rounded text-center transition-colors"
                >
                  Contact About This Recruit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to roster */}
      <section className="bg-[#F7F7F7] py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/recruits" className="inline-flex items-center gap-2 text-[#337C99] hover:text-[#265d73] font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Recruits
          </Link>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
