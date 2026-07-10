"use client";

import { useState } from "react";

export default function InlineContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3" style={{ backgroundColor: "#337C99", minHeight: "220px" }}>
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-white font-bold text-lg">Message Sent!</p>
        <p className="text-white/80 text-sm">Thank you for reaching out. A member of our team will be in touch with you shortly.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
          className="mt-2 text-white/70 hover:text-white text-xs underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#337C99" }}>
      <p className="text-xl font-bold text-white text-center mb-5">Let&apos;s Get Started:</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        />
        <textarea
          rows={4}
          placeholder="How can we help you?"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="w-full bg-white border-0 rounded px-4 py-2.5 text-[#212529] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-white/50 text-sm resize-none"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
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
