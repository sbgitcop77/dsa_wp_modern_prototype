import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Our Recruits",
  description:
    "Browse our roster of recruits training at The Diamond Sports Academy. Each profile includes performance metrics, video highlights, and contact-ready information.",
};

const RECRUITS = [
  {
    name: "Isaiah Thompson",
    slug: "isaiah-thompson",
    position: "Pitcher (RHP)",
    classYear: "2025",
    image: "/images/isaiah-thompson.webp",
  },
  {
    name: "Jacob Delgado",
    slug: "jacob-delgado",
    position: "Catcher",
    classYear: "2025",
    image: "/images/jacob-delgado.webp",
  },
  {
    name: "Jaxon Rivera",
    slug: "jaxon-rivera",
    position: "Shortstop",
    classYear: "2026",
    image: "/images/jaxon-rivera.webp",
  },
  {
    name: "Mason Turner",
    slug: "mason-turner",
    position: "Pitcher (RHP)",
    classYear: "2026",
    image: "/images/mason-turner.webp",
  },
];

export default function RecruitsPage() {
  return (
    <>
      {/* Page header with background image */}
      <section className="relative py-20 flex items-end" style={{ minHeight: "260px" }}>
        <Image
          src="/images/baseball-in-field.webp"
          alt="Baseball In Field"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[#00141B]/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Our Recruits</h1>
        </div>
      </section>

      {/* Recruit Database */}
      <section className="bg-[#F7F7F7] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest text-center mb-2">
            Program Recruits
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#212529] text-center mb-4">
            Recruit Database
          </h2>
          <p className="text-[#6c757d] text-center mb-12 max-w-2xl mx-auto">
            Browse our roster of recruits training at The Diamond Sports Academy. Each profile includes performance metrics, video highlights, and contact-ready information.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {RECRUITS.map((r) => (
              <Link
                key={r.slug}
                href={`/recruits/${r.slug}`}
                className="group text-center text-decoration-none"
              >
                {/* Circular photo */}
                <div className="relative w-44 h-44 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:shadow-lg transition-shadow">
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    className="object-cover object-top"
                    sizes="176px"
                  />
                </div>

                <h3 className="text-[#212529] font-bold text-lg mb-1">{r.name}</h3>
                <p className="text-[#6c757d] text-sm mb-1">{r.position}</p>
                <p className="text-[#337C99] text-sm font-semibold">Class of {r.classYear}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <CtaBanner />
    </>
  );
}
