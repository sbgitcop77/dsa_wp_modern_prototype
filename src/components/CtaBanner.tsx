import Link from "next/link";

interface CtaBannerProps {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function CtaBanner({
  title = "Let's Train Together",
  body = "At The Diamond Sports Academy, we believe every athlete has the potential to compete at their highest level. From private lessons to elite development programs, our coaches provide the training, mentorship, and support needed to build confidence, skill, and discipline — both on and off the field.",
  ctaLabel = "Start Your Training",
  ctaHref = "/contact-us",
}: CtaBannerProps) {
  return (
    <section className="bg-[#00141B] py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">{title}</h2>
        <p className="text-white/70 text-lg leading-relaxed mb-8">{body}</p>
        <Link
          href={ctaHref}
          className="inline-block bg-[#f33b41] hover:bg-[#d62f35] text-white font-semibold px-8 py-4 rounded transition-colors text-lg"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
