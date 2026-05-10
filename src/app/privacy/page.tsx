import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#212529] mb-8">Privacy Policy</h1>
        <p className="text-[#6c757d] mb-6">Last updated: 2026</p>

        <div className="space-y-8 text-[#6c757d] leading-relaxed">
          <div>
            <h2 className="text-[#212529] font-semibold text-xl mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your name, email address, phone number, and any messages you send via our contact form.</p>
          </div>

          <div>
            <h2 className="text-[#212529] font-semibold text-xl mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to respond to your inquiries, schedule training sessions, send program updates, and improve our services.</p>
          </div>

          <div>
            <h2 className="text-[#212529] font-semibold text-xl mb-3">3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent, except as required by law.</p>
          </div>

          <div>
            <h2 className="text-[#212529] font-semibold text-xl mb-3">4. Cookies</h2>
            <p>Our website may use cookies to enhance your experience. You can choose to disable cookies through your browser settings.</p>
          </div>

          <div>
            <h2 className="text-[#212529] font-semibold text-xl mb-3">5. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <a href="tel:+14438651639" className="text-[#337C99] hover:text-[#265d73] transition-colors">
                (443) 865-1639
              </a>{" "}
              or visit us at 8274 Lokus Rd, Odenton, MD 21113.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
