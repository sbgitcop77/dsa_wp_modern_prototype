import type { Metadata } from "next";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about training programs, memberships, facility rentals, technology, and more at The Diamond Sports Academy.",
};

const FAQS = [
  {
    q: "What ages and skill levels do you train?",
    a: "We welcome players of all ages and skill levels — from youth athletes just learning the game to advanced high school and college-level players. Sessions are tailored to each athlete's goals, experience, and needs.",
  },
  {
    q: "What types of training does The Diamond Sports Academy offer?",
    a: "The academy provides personalized and group sessions in hitting, pitching, catching, fielding, speed and agility, and strength training. Programs serve youth players through collegiate prospects.",
  },
  {
    q: "How do I schedule a training session?",
    a: "You can book directly through our online scheduling system or contact us by phone or text to reserve your time slot. Early booking is recommended during peak seasons and school breaks.",
  },
  {
    q: "Do you offer team or facility rentals?",
    a: "Yes. Teams can rent individual lanes, multiple tunnels, or the entire facility for practice sessions, scrimmages, and workouts. Technology add-ons like HitTrax or Rapsodo are available upon request.",
  },
  {
    q: "Are memberships available?",
    a: "Absolutely. We offer monthly memberships that provide full access to our facility and training equipment for independent workouts outside scheduled lessons. Player memberships are $80/month; parent memberships are $20/month.",
  },
  {
    q: "What technology and tools are available for training?",
    a: "The facility features HitTrax, Rapsodo, and high-speed video analysis — providing real-time performance tracking and data-driven improvement feedback on every swing and pitch.",
  },
  {
    q: "Do you host camps or seasonal clinics?",
    a: "Yes. The academy offers specialized camps and clinics throughout the year including Spring Break Tune-Up, Summer All-Skills, Fall Development, and Winter Elite camps, along with throwing velocity and exit velocity clinics.",
  },
];

export default function FaqPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-[#00141B] py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">FAQ</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5">
            Frequently Asked Questions
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            At The Diamond Sports Academy, we understand that every athlete and family wants the best path to success. Whether you&apos;re exploring private lessons, facility rentals, or membership options, we&apos;ve gathered our most common questions to help you get started with confidence.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-[#F7F7F7] border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-[#212529] font-semibold pr-4">{faq.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-[#6c757d] group-open:rotate-45 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[#6c757d] leading-relaxed text-sm">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* Still have questions */}
          <div className="text-center mt-12 pt-10 border-t border-gray-200">
            <p className="text-[#212529] font-semibold text-lg mb-2">Still have questions?</p>
            <p className="text-[#6c757d] mb-6">We&apos;re happy to help — reach out by call or text.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+14438651639"
                className="inline-block bg-[#337C99] hover:bg-[#265d73] text-white font-semibold px-7 py-3.5 rounded transition-colors"
              >
                Call Us!
              </a>
              <a
                href="sms:+14438651639"
                className="inline-block border-2 border-[#337C99] text-[#337C99] hover:bg-[#337C99] hover:text-white font-semibold px-7 py-3.5 rounded transition-colors"
              >
                Text Us!
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
