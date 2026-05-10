import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Reviews & Testimonials",
  description:
    "Read what athletes and families say about The Diamond Sports Academy. Real stories from real players who trained with us.",
};

const REVIEWS = [
  {
    author: "Tina M.",
    quote: "After trying a few local training options, we found The Diamond — and I wish we started here sooner! The progress has been amazing, but even better is the mentorship my son receives. The coaches treat every player like family while still holding them to a high standard.",
  },
  {
    author: "Brandon L.",
    quote: "I've trained with Coach Chris and his team since last year, and they've helped me prepare for college-level baseball. The focus on mindset and preparation really sets The Diamond apart from other places. It's not just about hitting or pitching — it's about becoming a complete player.",
  },
  {
    author: "Samantha D.",
    quote: "From the turf lanes to the weight room and tech tunnels, this place has it all. You can work on every aspect of your game under one roof. The environment feels professional yet welcoming for athletes of all ages and skill levels.",
  },
  {
    author: "Kevin T.",
    quote: "The Diamond Sports Academy is more than a training facility — it's a community. Every coach motivates you to push harder but also celebrates your wins. My daughter has grown so much as an athlete and gained real confidence and discipline since joining.",
  },
  {
    author: "Melissa P.",
    quote: "My son trains here weekly for pitching, and we're blown away by how much data they use to track progress. The HitTrax and Rapsodo systems help him visualize improvement, and the coaches break everything down in a way that actually makes sense. It's not just training — it's development done right.",
  },
  {
    author: "Evan R.",
    quote: "I started private hitting lessons at The Diamond Sports Academy a few months ago, and the difference is night and day. The coaches genuinely care about each athlete's progress and push you to be better every session. The personalized instruction and mechanical coaching have made a huge difference.",
  },
];

export default function ReviewsPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative h-72 lg:h-80 flex items-center">
        <Image
          src="/images/indoor-training-facility.webp"
          alt="Indoor Training Facility"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00141B]/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Success Stories</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Success Stories
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#212529] mb-4">What Athletes and Families Say About The Diamond Sports Academy</h2>
          <p className="text-[#6c757d] text-lg leading-relaxed">
            At The Diamond Sports Academy, we take pride in helping players reach their full potential — on and off the field. From private lessons to team development, our athletes and parents share how our coaches, technology, and training programs have made a lasting impact.
          </p>
        </div>
      </section>

      {/* Reviews grid */}
      <section className="bg-[#F7F7F7] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div
                key={r.author}
                className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col gap-5 hover:border-[#337C99]/40 hover:shadow-md transition-all"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-[#f33b41]" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[#6c757d] leading-relaxed flex-1">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-9 h-9 rounded-full bg-[#337C99]/15 flex items-center justify-center text-[#337C99] font-bold text-sm">
                    {r.author[0]}
                  </div>
                  <p className="text-[#212529] font-semibold">{r.author}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-[#212529] mb-3">Share Your Experience</h2>
            <p className="text-[#6c757d] mb-6 max-w-lg mx-auto">
              Have you trained with us? We&apos;d love to hear about your experience. Reach out directly — your story helps other families find the right fit.
            </p>
            <Link href="/contact-us" className="inline-block bg-[#f33b41] hover:bg-[#d62f35] text-white font-semibold px-7 py-3.5 rounded transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
