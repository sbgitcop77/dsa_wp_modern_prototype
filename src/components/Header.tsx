"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV = [
  { label: "Home", href: "/", hideMobile: false },
  {
    label: "About",
    href: "/about-us",
    children: [
      { label: "Our Company", href: "/about-us" },
      { label: "Our Facility", href: "/our-facility" },
      { label: "Our Coaches", href: "/our-coaches" },
      { label: "Our Recruits", href: "/recruits" },
      { label: "Our Alumni", href: "/our-alumni" },
    ],
  },
  {
    label: "Programs",
    href: "/training",
    children: [
      { label: "Camps", href: "/camps" },
      { label: "Clinics", href: "/clinics" },
      { label: "Training", href: "/training" },
    ],
  },
  {
    label: "Services",
    href: "/1-on-1-training",
    children: [
      { label: "1-on-1 Training", href: "/1-on-1-training" },
      { label: "Golf Simulator", href: "/golf-simulator" },
      { label: "Memberships", href: "/memberships" },
      { label: "Speed & Agility", href: "/speed-agility" },
      { label: "Team Facility Rentals", href: "/team-facility-rentals" },
      { label: "Technology Tunnels", href: "/technology-tunnels" },
      { label: "Weight Training", href: "/weight-training" },
    ],
  },
  { label: "FAQ", href: "/frequently-asked-questions" },
  { label: "Reviews", href: "/reviews", hideSmall: true },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "scrolled" : ""
      }`}
      style={scrolled ? {} : { backgroundColor: "transparent" }}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16 lg:h-20 w-full">

          {/* Mobile: phone icon (left) */}
          <a
            href="tel:+14438651639"
            className="lg:hidden text-white mr-2 flex-shrink-0"
            aria-label="Call"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
            </svg>
          </a>

          {/* Logo — centered on mobile, left on desktop */}
          <Link
            href="/"
            className="flex-shrink-0 mx-auto lg:mx-0"
          >
            <Image
              src="/images/logo-web.webp"
              alt="The Diamond Sports Academy"
              width={180}
              height={36}
              className={`h-10 lg:h-12 w-auto object-contain transition-all duration-300 ${
                scrolled ? "" : "invert"
              }`}
              style={scrolled ? {} : { filter: "invert(1)" }}
              priority
            />
          </Link>

          {/* Desktop: nav + CTA */}
          <div className="hidden lg:flex items-center justify-end flex-1">
            {/* Divider */}
            <div className="w-px h-6 bg-white/30 mx-4 flex-shrink-0" />

            {/* Nav links */}
            <ul className="flex items-center gap-0 list-none m-0 p-0">
              {NAV.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="nav-link px-3 py-2 flex items-center gap-1 text-sm bg-transparent border-0 cursor-pointer">
                      {item.label}
                      <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 min-w-[200px] bg-white border border-gray-200 shadow-xl rounded py-1 z-50">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-light text-[#212529] hover:bg-gray-50 hover:text-primary transition-colors"
                            style={{ color: "#212529" }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-link px-3 py-2 text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>

            {/* Book a Session */}
            <Link
              href="/book"
              className="ml-3 px-5 py-2 border-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                borderColor: "#f33b41",
                color: "#f33b41",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#f33b41";
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#f33b41";
              }}
            >
              Book a Session
            </Link>

            {/* Divider + phone */}
            <div className="w-px h-6 bg-white/30 mx-4 flex-shrink-0" />
            <a
              href="tel:+14438651639"
              className={`text-sm font-semibold transition-colors ${
                scrolled ? "text-[#212529]" : "text-white"
              }`}
            >
              (443) 865-1639
            </a>
          </div>

          {/* Mobile: hamburger (right) */}
          <button
            className="lg:hidden p-2 text-white flex-shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#00141B] border-t border-white/10">
          <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-white"
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.label ? null : item.label)
                    }
                  >
                    {item.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-white/75 hover:text-white"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-semibold text-white hover:text-white/80"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <a href="tel:+14438651639" className="text-center text-sm text-white/70">
                (443) 865-1639
              </a>
              <Link
                href="/book"
                className="text-center text-sm font-semibold px-5 py-3 rounded border-2 border-warning text-warning"
                onClick={() => setMobileOpen(false)}
              >
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
