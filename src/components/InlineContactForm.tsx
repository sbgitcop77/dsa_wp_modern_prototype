"use client";

export default function InlineContactForm() {
  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#337C99" }}>
      <p className="text-xl font-bold text-white text-center mb-5">Let&apos;s Get Started:</p>
      <form action="/api/contact" method="POST" className="space-y-3">
        <input
          type="text"
          name="name"
          required
          placeholder="Name"
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <textarea
          name="message"
          rows={4}
          placeholder="How can we help you?"
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm resize-none"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <button
          type="submit"
          className="w-full text-white font-semibold px-6 py-2.5 rounded transition-colors text-sm"
          style={{ backgroundColor: "#265d73" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
