import Link from "next/link";
import Image from "next/image";
import { OPERATING_HOURS } from "@/data/mock/schedule";

const DAY_ABBR: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function groupedHours() {
  const rows: { label: string; value: string }[] = [];
  let i = 0;
  while (i < OPERATING_HOURS.length) {
    const cur = OPERATING_HOURS[i];
    let j = i + 1;
    while (
      j < OPERATING_HOURS.length &&
      OPERATING_HOURS[j].isClosed === cur.isClosed &&
      OPERATING_HOURS[j].openTime === cur.openTime &&
      OPERATING_HOURS[j].closeTime === cur.closeTime
    ) j++;
    const start = DAY_ABBR[cur.dayOfWeek];
    const end = j - 1 > i ? DAY_ABBR[OPERATING_HOURS[j - 1].dayOfWeek] : null;
    rows.push({
      label: end ? `${start}–${end}` : start,
      value: cur.isClosed ? "Closed" : `${fmtTime(cur.openTime)} – ${fmtTime(cur.closeTime)}`,
    });
    i = j;
  }
  return rows;
}

const FOOTER_COL1 = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "FAQ", href: "/frequently-asked-questions" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy" },
];

const FOOTER_COL2 = [
  { label: "Training", href: "/training" },
  { label: "Clinics", href: "/clinics" },
  { label: "Camps", href: "/camps" },
  { label: "Our Facility", href: "/our-facility" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <Image
                src="/images/the-diamond-sports-academy-logo-white-1024x209.png"
                alt="The Diamond Sports Academy"
                width={280}
                height={57}
                className="h-10 w-auto object-contain mb-5"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              Building better ballplayers since 2022. Elite coaching, advanced technology, and a family-style environment in Odenton, MD.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/p/The-Diamond-Sports-Academy-100088094180071/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#f33b41] flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/the_diamond_sports_academy/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#f33b41] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links col 1 */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_COL1.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/55 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links col 2 + contact */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-5">Programs</h3>
            <ul className="space-y-3 mb-8">
              {FOOTER_COL2.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/55 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white text-sm font-semibold uppercase tracking-widest mb-4">Contact</h3>
            <address className="not-italic space-y-2">
              <p className="text-white/55 text-sm">8274 Lokus Rd<br />Odenton, MD 21113</p>
              <a href="tel:+14438651639" className="block text-white/55 hover:text-white text-sm transition-colors">
                (443) 865-1639
              </a>
              <div className="text-white/55 text-sm space-y-0.5">
                {groupedHours().map(row => (
                  <p key={row.label}>{row.label}: {row.value}</p>
                ))}
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/40">
          <p>© 2026 The Diamond Sports Academy. All Rights Reserved.</p>
          <p>
            Designed by{" "}
            <a href="https://www.akikatech.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">
              Akika Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
