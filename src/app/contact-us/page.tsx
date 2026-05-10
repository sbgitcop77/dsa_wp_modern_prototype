import type { Metadata } from "next";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Diamond Sports Academy. Book a session, ask about memberships, or schedule a facility rental. Located in Odenton, MD.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative h-64 lg:h-80 flex items-end">
        <Image
          src="/images/batting-baseball-scaled.webp"
          alt="Batting Baseball"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00141B]/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Contact Us</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">Get In Touch</h1>
        </div>
      </section>

      {/* Contact content */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-[#212529] mb-8">Send Us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#212529] mb-6">Train, Compete, and Grow with Us</h2>
                <p className="text-[#6c757d] leading-relaxed">
                  Whether you&apos;re a parent, athlete, or coach, we&apos;d love to hear from you. Reach out to learn more about our training programs, memberships, or upcoming clinics.
                </p>
              </div>

              <div className="space-y-5">
                {/* Location */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#337C99]/10 border border-[#337C99]/20 flex items-center justify-center text-[#337C99] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#212529] font-semibold mb-1">Location</p>
                    <p className="text-[#6c757d] text-sm">8274 Lokus Rd<br />Odenton, MD 21113</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#337C99]/10 border border-[#337C99]/20 flex items-center justify-center text-[#337C99] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#212529] font-semibold mb-1">Phone (Call & Text)</p>
                    <a href="tel:+14438651639" className="text-[#6c757d] hover:text-[#337C99] text-sm transition-colors">
                      (443) 865-1639
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#337C99]/10 border border-[#337C99]/20 flex items-center justify-center text-[#337C99] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#212529] font-semibold mb-1">Training Hours</p>
                    <p className="text-[#6c757d] text-sm">Mon–Fri: 8:00 AM – 8:00 PM</p>
                    <p className="text-[#6c757d] text-sm">Saturday: 9:00 AM – 5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <p className="text-[#212529] font-semibold mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.facebook.com/p/The-Diamond-Sports-Academy-100088094180071/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#6c757d] hover:text-[#337C99] text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/the_diamond_sports_academy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#6c757d] hover:text-[#337C99] text-sm transition-colors"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Full-width map below columns */}
          <div className="mt-12 rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4664.647985970036!2d-76.7006286!3d39.0990383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7e5ebe5428ced%3A0xac706c153e64b5e2!2sThe%20Diamond%20Sports%20Academy!5e1!3m2!1sen!2sus!4v1761159598831!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Diamond Sports Academy location"
            />
          </div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}

function ContactForm() {
  return (
    <form
      action="/api/contact"
      method="POST"
      className="space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[#212529] mb-2">Your Name *</label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:border-[#337C99] transition-colors text-sm"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#212529] mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:border-[#337C99] transition-colors text-sm"
            placeholder="(443) 555-0100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          required
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:border-[#337C99] transition-colors text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#212529] mb-2">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:border-[#337C99] transition-colors text-sm resize-none"
          placeholder="Tell us about the athlete, their age, position, and what you're looking for..."
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto bg-[#f33b41] hover:bg-[#d62f35] text-white font-semibold px-8 py-3.5 rounded transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
