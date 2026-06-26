import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Elite Baseball & Softball Training in Maryland | The Diamond Sports Academy",
  description:
    "Train like a pro at The Diamond Sports Academy — Maryland's premier baseball and softball training facility. Offering private lessons, clinics, speed and agility programs, and team rentals for athletes of all levels.",
};

const SERVICES = [
  {
    img: "/images/batting-baseball-scaled.webp",
    alt: "Batting Baseball",
    title: "1-on-1 Training",
    desc: "Personalized sessions for hitting, pitching, fielding, and catching.",
    cta: "Schedule a Session",
    href: "/1-on-1-training",
  },
  {
    img: "/images/speed-training-scaled.webp",
    alt: "Speed Training",
    title: "Speed & Agility",
    desc: "Explosive movement training to improve strength, reaction, and athleticism.",
    cta: "Start Speed Training",
    href: "/speed-agility",
  },
  {
    img: "/images/golf-ball-in-field-scaled.webp",
    alt: "Golf Ball In Field",
    title: "Golf Simulator",
    desc: "Experience top courses virtually and refine your swing year-round.",
    cta: "Reserve Time",
    href: "/golf-simulator",
  },
  {
    img: "/images/weights-on-rack.webp",
    alt: "Weights On Rack",
    title: "Weight Training",
    desc: "Strength programs with a personal trainer (individual or small group).",
    cta: "Join a Group",
    href: "/weight-training",
  },
  {
    img: "/images/the-diamond-sports-academy-facility.webp",
    alt: "The Diamond Sports Academy Facility",
    title: "Team Rentals",
    desc: "Rent two lanes or the full facility for practices, scrimmages, or private sessions.",
    cta: "Book Facility",
    href: "/team-facility-rentals",
  },
];

const WHY_US = [
  {
    title: "Professional Coaching",
    desc: "Learn from former collegiate players and professional instructors.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
        <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492z"/>
      </svg>
    ),
  },
  {
    title: "Technology-Driven",
    desc: "Featuring HitTrax, Rapsodo, and data feedback to track real progress.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 6a6 6 0 1 0 12 0A6 6 0 0 0 0 6m13.25 10.5-3.5-3.5a6 6 0 0 1-1.415 1.414l3.5 3.5a1 1 0 0 0 1.415-1.414z"/>
      </svg>
    ),
  },
  {
    title: "Elite Facilities",
    desc: "Train in a pro-level environment with lanes, cages, and performance zones.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
        <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
      </svg>
    ),
  },
  {
    title: "Performance Focused",
    desc: "From speed and agility to hitting velocity — every session builds results.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
        <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "What types of athletes do you train?",
    a: "We welcome baseball and softball players of all ages and skill levels — from youth just learning the fundamentals to high school and college athletes preparing for the next level. Each session is customized to the athlete's position, goals, and development stage.",
  },
  {
    q: "Do you offer private or group training sessions?",
    a: "Yes! We offer both one-on-one instruction and small-group sessions. Private lessons allow for focused, individualized development, while group training encourages competition, teamwork, and accountability among peers.",
  },
  {
    q: "What technology or tools do you use during training?",
    a: "Our facility is equipped with industry-leading technology including HitTrax, Rapsodo, and Blast Motion systems. These tools provide real-time data on swing mechanics, exit velocity, and pitching metrics — helping players track progress and make measurable improvements.",
  },
  {
    q: "Can teams or organizations rent the facility?",
    a: "Absolutely. Local teams and travel organizations can reserve lanes, cages, or the full facility for practices, scrimmages, or skill development clinics. Team rentals are available year-round and can be customized based on your team's schedule and needs.",
  },
  {
    q: "How can I get started with training?",
    a: "Getting started is easy — simply contact us or visit our Training page to schedule your first session. Our staff will match you with the right coach and program based on your goals, skill level, and availability.",
  },
];

const COACHES = [
  { name: "Chris Ford", title: "Owner & Founder" },
  { name: "Coach Megan", title: "Pitching & Conditioning" },
  { name: "Syeed Mahdi", title: "Hitting & Fielding Instructor" },
  { name: "Connor Hax", title: "Baseball Instructor" },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative overflow-hidden text-danger"
        style={{ minHeight: "100vh" }}
      >
        {/* Background image */}
        <Image
          src="/images/baseball-bat-and-balls.webp"
          alt="Baseball Bat And Balls"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay */}
        <div
          id="hero-cover"
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(180deg, rgb(0 0 0), rgb(0 0 0 / 10%), rgb(0 0 0 / 40%), rgb(0 0 0 / 88%), rgba(0, 0, 0, 1))",
            opacity: 0.9,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 py-20 pt-40 lg:pt-44">
          <div
            id="hero-content"
            className="flex items-center justify-center text-center"
            style={{ minHeight: "450px" }}
          >
            <div className="max-w-4xl text-white">
              <h1 className="mb-3 font-bold text-white" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)", lineHeight: 1.15 }}>
                Train the Mind. Build the Body. Master the Game.
              </h1>
              <p className="mb-4 text-white" style={{ fontSize: "1.5rem", opacity: 0.9 }}>
                Elite Athlete Training - Where Dedication Meets Development.
              </p>
              <p className="mb-6 text-white/75 text-base max-w-2xl mx-auto hidden sm:block">
                From private lessons to full camps, The Diamond Sports Academy helps athletes of all ages reach their potential through proven instruction, advanced technology, and a culture built on respect and hard work.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="#dsa-home-services"
                  className="px-6 py-3 rounded font-semibold text-white shadow transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#337C99", border: "1px solid #337C99" }}
                >
                  View Programs
                </Link>
                <Link
                  href="/book"
                  className="px-6 py-3 rounded font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#b6070e", border: "1px solid #b6070e" }}
                >
                  Book a Session
                </Link>
                <Link
                  href="/about-us"
                  className="px-6 py-3 rounded font-semibold transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#F7F7F7", color: "#212529", border: "1px solid #F7F7F7" }}
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left stat badge */}
        <div
          className="hero-badge absolute bottom-0 start-0 hidden lg:block text-white p-3"
          style={{
            backgroundColor: "#b6070e",
            border: "3px solid white",
            borderRadius: "1rem 1rem 0 1rem",
            left: "2rem",
          }}
        >
          <h3 className="mb-0 font-bold leading-none" style={{ fontSize: "2.5rem" }}>3</h3>
          <p className="small mb-0 uppercase text-sm tracking-wide">Years of Excellence</p>
        </div>
      </section>

      {/* ── ENROLLMENT BANNER ── */}
      <Link
        href="/training"
        className="block w-full text-center text-white font-semibold py-3.5 px-4 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#337C99" }}
      >
        Now Enrolling for Winter Training!{" "}
        <span className="hidden sm:inline">Secure Your Spot →</span>
        <span className="sm:hidden">Secure Your Spot →</span>
      </Link>

      {/* ── WHO WE ARE ── */}
      <section className="pt-14 text-center md:text-left bg-white border-t-4 border-primary">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-4">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center pb-4">
            {/* Text */}
            <div className="order-2 md:order-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#337C99" }}>
                Who We Are
              </h2>
              <h2 className="font-bold mb-4" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
                Building Better <br />
                Ballplayers{" "}
                <span style={{ color: "#b6070e" }} className="italic">since 2022</span>
              </h2>
              <p className="mb-5 text-[#6c757d]">
                At The Diamond Sports Academy, we combine elite coaching, advanced technology, and a family-style environment to help athletes reach their full potential — on and off the field.
              </p>
              <ul className="list-none p-0 mb-6 hidden xl:block space-y-3">
                {[
                  "Experienced instructors with college-level backgrounds",
                  "Individualized training and small-group focus",
                  "Strength, conditioning, and skill development programs",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#212529]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="flex-shrink-0" style={{ color: "#b6070e" }} viewBox="0 0 16 16">
                      <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                      <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/training"
                className="inline-block px-6 py-2.5 rounded-full font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#337C99" }}
              >
                Discover Programs
              </Link>
            </div>

            {/* Image */}
            <div className="order-1 md:order-2 text-center">
              <Image
                src="/images/baseball-training-equipment.webp"
                alt="Baseball Training Equipment"
                width={600}
                height={600}
                className="img-fluid rounded-xl border-4 border-white shadow-lg mx-auto"
                style={{ maxWidth: "100%", height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS / FEATURE CARDS ── */}
      <section className="pb-14 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { num: "150+", label: "Active Athletes" },
              { num: "300+", label: "Program Graduates" },
              { num: "10+", label: "Expert Coaches" },
            ].map((s) => (
              <div key={s.label} className="stat-circle text-center">
                <span className="font-bold leading-none" style={{ fontSize: "2.2rem", color: "#337C99" }}>
                  {s.num}
                </span>
                <span className="mt-1 text-[#6c757d]" style={{ fontSize: "0.85rem" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Qualified Coaches", desc: "Our instructors bring college and professional experience to every session, providing expert insight and mentorship." },
              { title: "Advanced Technology", desc: "We use tools like Rapsodo and Blast Motion to deliver measurable feedback and track player growth." },
              { title: "Player Development", desc: "From youth to high school, our programs focus on discipline, confidence, and the skills that lead to success." },
            ].map((f) => (
              <div key={f.title} className="bg-[#F7F7F7] rounded-xl p-6">
                <div className="w-8 h-0.5 mb-3" style={{ backgroundColor: "#337C99" }} />
                <h3 className="font-semibold text-lg mb-2 text-[#212529]">{f.title}</h3>
                <p className="text-[#6c757d] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ── */}
      <section
        id="dsa-home-services"
        className="py-14"
        style={{ backgroundImage: "linear-gradient(to top, #0e2730, #00141B)" }}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center text-white mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#f33b41" }}>
              What We Offer
            </h2>
            <h2 className="font-bold mb-3 text-white" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
              Train. Compete. Elevate.
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              At The Diamond Sports Academy, we combine advanced technology, professional instruction, and personalized coaching to help athletes of all levels perform at their best.
            </p>
          </div>

          {/* Program grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-white">
            {SERVICES.map((s) => (
              <div key={s.title} className="program-tile">
                <Image
                  src={s.img}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="program-overlay">
                  <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-white/80 mb-3">{s.desc}</p>
                  <Link
                    href={s.href}
                    className="inline-block px-4 py-2 rounded text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#337C99" }}
                  >
                    {s.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-10 text-center text-white border border-white/20 rounded-xl p-8">
            <h3 className="font-bold text-xl mb-2">Where Dedication Meets Development</h3>
            <p className="text-white/65 mb-5 max-w-xl mx-auto">
              At The Diamond Sports Academy, athletes train with purpose. Through expert coaching, technology, and teamwork, we help players improve every day.
            </p>
            <Link
              href="/contact-us"
              className="inline-block px-7 py-3 rounded font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#337C99" }}
            >
              Start Training →
            </Link>
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="diamond-values relative overflow-hidden py-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#337C99" }}>
            Our Values
          </h2>
          <h2 className="font-bold mb-10 text-[#212529]" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
            Inspiring the Future, Achieving Together.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Vision */}
            <div
              className="value-card text-left rounded-2xl overflow-hidden"
              style={{ backgroundImage: "linear-gradient(to left, #337C99, #00141B)" }}
            >
              <div className="p-8 lg:p-10 relative z-10">
                <div
                  className="icon-circle mb-4"
                  style={{ backgroundColor: "#337C99", color: "#fff" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
                    <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Our Vision</h3>
                <p className="text-white text-sm leading-relaxed mb-5">
                  To create an elite-level academy that develops athletes through discipline, mentorship, and advanced technology — building champions both on and off the field.
                </p>
                <Link
                  href="/about-us"
                  className="inline-block px-5 py-2 rounded border-2 border-white text-white font-bold text-sm transition-all hover:bg-white hover:text-[#00141B]"
                >
                  About Us
                </Link>
              </div>
              <Image
                src="/images/young-baseball-player-scaled-e1760839467856.webp"
                alt="Young Baseball Player"
                width={240}
                height={350}
                className="value-img hidden lg:block"
              />
            </div>

            {/* Mission */}
            <div
              className="value-card text-left rounded-2xl overflow-hidden"
              style={{ backgroundImage: "linear-gradient(to left, #b6070e, #00141B)" }}
            >
              <div className="p-8 lg:p-10 relative z-10">
                <div
                  className="icon-circle mb-4"
                  style={{ backgroundColor: "#b6070e", color: "#fff" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Our Mission</h3>
                <p className="text-white text-sm leading-relaxed mb-5">
                  To provide top-tier training that blends data analytics, personal growth, and a family-style atmosphere — preparing athletes for success at every level of the game.
                </p>
                <Link
                  href="/training"
                  className="inline-block px-5 py-2 rounded border-2 border-white text-white font-bold text-sm transition-all hover:bg-white hover:text-[#00141B]"
                >
                  How We Train
                </Link>
              </div>
              <Image
                src="/images/golf-player-with-club-scaled.webp"
                alt="Golf Player With Club"
                width={240}
                height={350}
                className="value-img hidden lg:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section
        className="relative overflow-hidden text-white pt-14"
        style={{
          backgroundColor: "#0b0f13",
          backgroundImage: "url('/images/sports-field.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
            zIndex: 1,
          }}
        />

        <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 pb-14">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <div className="lg:pr-10 pb-5">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#337C99" }}>
                Why Choose Us
              </h2>
              <h2 className="font-bold mb-3 text-white" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
                Where Dedication Meets Development
              </h2>
              <p className="mb-8" style={{ color: "#cfd4da" }}>
                At The Diamond Sports Academy, we don&apos;t just coach — we build complete athletes. Our programs combine advanced analytics, personalized instruction, and strength development to help players excel on and off the field.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                {WHY_US.map((w) => (
                  <div key={w.title} className="flex items-start gap-3">
                    <div className="why-icon flex-shrink-0" style={{ backgroundColor: "#b6070e", color: "#fff" }}>
                      {w.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1 text-white">{w.title}</h3>
                      <p className="text-sm" style={{ color: "#cfd4da" }}>{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEET OUR COACHES ── */}
      <section className="diamond-team text-center relative overflow-hidden py-14" style={{ backgroundColor: "#F7F7F7" }}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#337C99" }}>
            Meet Our Coaches
          </h2>
          <h2 className="font-bold mb-10 text-[#212529]" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
            Elite Trainers, Proven Results
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {COACHES.map((c) => (
              <div key={c.name} className="group">
                <div className="relative w-40 h-40 mx-auto mb-3 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <Image
                    src="/images/placeholder-diamond-team-member.webp"
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <h3 className="font-bold text-lg text-[#212529]">{c.name}</h3>
                <p className="text-sm font-medium mt-1" style={{ color: "#337C99" }}>{c.title}</p>
              </div>
            ))}
          </div>

          <Link
            href="/our-coaches"
            className="inline-block px-7 py-2.5 rounded border-2 font-semibold transition-all"
            style={{ borderColor: "#337C99", color: "#337C99", backgroundColor: "transparent" }}
          >
            Our Coaching Staff →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── bg-info = #00141B ── */}
      <section className="pb-14 pt-12" style={{ backgroundColor: "#00141B" }}>
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest mb-2 text-white/60">
              Frequently Asked Questions
            </h2>
            <h2 className="font-bold mb-3 text-white" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>
              Clear Answers for Players and Parents
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              At The Diamond Sports Academy, we understand that every athlete and family wants the best path to success.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl overflow-hidden border border-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-white font-semibold pr-4">{f.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-white/60 group-open:rotate-45 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 text-white/65 leading-relaxed text-sm">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/frequently-asked-questions"
              className="text-sm font-semibold transition-colors"
              style={{ color: "#337C99" }}
            >
              View All FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── bg-light ── */}
      <Testimonials />

      {/* ── FINAL CTA ── bg-black ── */}
      <CtaBanner />
    </>
  );
}
// test
