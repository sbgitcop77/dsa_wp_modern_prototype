"use client";

import { useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "After trying a few local training options, we found The Diamond — and I wish we started here sooner! The progress has been amazing, but even better is the mentorship my son receives. The coaches treat every player like family while still holding them to a high standard.",
    author: "Tina M.",
  },
  {
    quote:
      "I've trained with Coach Chris and his team since last year, and they've helped me prepare for college-level baseball. The focus on mindset and preparation really sets The Diamond apart from other places. It's not just about hitting or pitching — it's about becoming a complete player.",
    author: "Brandon L.",
  },
  {
    quote:
      "From the turf lanes to the weight room and tech tunnels, this place has it all. You can work on every aspect of your game under one roof. The environment feels professional yet welcoming for athletes of all ages and skill levels.",
    author: "Samantha D.",
  },
  {
    quote:
      "The Diamond Sports Academy is more than a training facility — it's a community. Every coach motivates you to push harder but also celebrates your wins. My daughter has grown so much as an athlete and gained real confidence and discipline since joining.",
    author: "Kevin T.",
  },
  {
    quote:
      "My son trains here weekly for pitching, and we're blown away by how much data they use to track progress. The HitTrax and Rapsodo systems help him visualize improvement, and the coaches break everything down in a way that actually makes sense. It's not just training — it's development done right.",
    author: "Melissa P.",
  },
  {
    quote:
      "I started private hitting lessons at The Diamond Sports Academy a few months ago, and the difference is night and day. The coaches genuinely care about each athlete's progress and push you to be better every session. The personalized instruction and mechanical coaching have made a huge difference.",
    author: "Evan R.",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? TESTIMONIALS.length - 1 : a - 1));
  const next = () => setActive((a) => (a === TESTIMONIALS.length - 1 ? 0 : a + 1));

  return (
    <section className="bg-[#F7F7F7] py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] mb-4">
          Hear From Our Athletes and Families
        </h2>
        <p className="text-[#6c757d] max-w-2xl mx-auto mb-14">
          At The Diamond Sports Academy, we take pride in helping players reach their full potential — on and off the field.
        </p>

        {/* Card */}
        <div className="relative bg-white border border-gray-200 rounded-xl p-8 lg:p-12 min-h-[220px] flex flex-col justify-between shadow-sm">
          {/* Quote icon */}
          <svg
            className="w-10 h-10 text-[#337C99]/25 mb-4 mx-auto"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>

          <blockquote className="text-[#212529] text-lg lg:text-xl leading-relaxed italic mb-6">
            &ldquo;{TESTIMONIALS[active].quote}&rdquo;
          </blockquote>

          <p className="text-[#337C99] font-semibold">— {TESTIMONIALS[active].author}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#337C99] hover:text-[#337C99] flex items-center justify-center transition-colors text-[#6c757d]"
            aria-label="Previous testimonial"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === active ? "bg-[#337C99] w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-300 hover:border-[#337C99] hover:text-[#337C99] flex items-center justify-center transition-colors text-[#6c757d]"
            aria-label="Next testimonial"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
