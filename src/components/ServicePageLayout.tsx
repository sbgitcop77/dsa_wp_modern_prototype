import Image from "next/image";
import Link from "next/link";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";
import InlineContactForm from "@/components/InlineContactForm";

// A string renders as a <p>. A string[] renders as a <ul> bullet list.
type ContentItem = string | string[];

interface ServicePageProps {
  badge: string;
  headline: string;
  heroBg: string;
  heroAlt: string;
  introParagraphs: ContentItem[];
  whyTitle: string;
  whyParagraphs: ContentItem[];
  whoTitle?: string;
  whoText: string;
  contentImage?: string;
  contentImageAlt?: string;
  overviewTitle: string;
  overviewParagraphs: ContentItem[];
  closingTagline: string;
  closingParagraph: string;
  ctaLabel?: string;
  relatedLinks?: { label: string; href: string }[];
}

function renderBullet(text: string) {
  const match = text.match(/^([^:]+):([\s\S]+)$/);
  if (match) {
    return <><strong>{match[1]}</strong>:{match[2]}</>;
  }
  return <>{text}</>;
}

function renderContentItems(items: ContentItem[]) {
  return items.map((item, i) => {
    if (Array.isArray(item)) {
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 text-[#212529]">
          {item.map((bullet, j) => (
            <li key={j} className="leading-relaxed">{renderBullet(bullet)}</li>
          ))}
        </ul>
      );
    }
    return <p key={i} className="text-[#212529] leading-relaxed">{item}</p>;
  });
}

export default function ServicePageLayout({
  badge,
  headline,
  heroBg,
  heroAlt,
  introParagraphs,
  whyTitle,
  whyParagraphs,
  whoTitle = "Who Can Benefit?",
  whoText,
  contentImage,
  contentImageAlt,
  overviewTitle,
  overviewParagraphs,
  closingTagline,
  closingParagraph,
  ctaLabel = "Book a Session",
  relatedLinks,
}: ServicePageProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-end" style={{ minHeight: "300px" }}>
        <Image
          src={heroBg}
          alt={heroAlt}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style={{ paddingTop: "120px", paddingBottom: "40px" }}>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">{badge}</h1>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Left: all content */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-2xl lg:text-3xl font-bold leading-snug" style={{ color: "#f33b41" }}>
                {headline}
              </h2>

              {renderContentItems(introParagraphs)}

              <h3 className="text-xl font-bold pt-3" style={{ color: "#f33b41" }}>{whyTitle}</h3>
              {renderContentItems(whyParagraphs)}

              <h3 className="text-xl font-bold pt-3" style={{ color: "#f33b41" }}>{whoTitle}</h3>
              <p className="text-[#212529] leading-relaxed">{whoText}</p>

              {contentImage && (
                <div className="relative rounded-xl overflow-hidden my-4" style={{ height: "280px" }}>
                  <Image
                    src={contentImage}
                    alt={contentImageAlt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                </div>
              )}

              <h3 className="text-2xl font-bold pt-3" style={{ color: "#f33b41" }}>{overviewTitle}</h3>
              {renderContentItems(overviewParagraphs)}

              <h3 className="text-2xl font-bold pt-3" style={{ color: "#f33b41" }}>{closingTagline}</h3>
              <p className="text-[#212529] leading-relaxed">{closingParagraph}</p>

              <div className="pt-2">
                <Link
                  href="/contact-us"
                  className="inline-block text-white font-semibold px-6 py-2.5 rounded-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#f33b41" }}
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>

            {/* Right: contact form (sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <InlineContactForm />
              <a
                href="tel:+14438651639"
                className="block text-center text-[#6c757d] hover:text-[#212529] text-sm mt-3 transition-colors"
              >
                Or call <span className="font-semibold">(443) 865-1639</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <section className="bg-[#F7F7F7] py-14 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Explore Other Services</h2>
            <div className="flex flex-wrap gap-3">
              {relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="border border-gray-300 hover:border-[#337C99] text-[#6c757d] hover:text-[#337C99] px-5 py-2.5 rounded text-sm font-medium transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials />
      <CtaBanner />
    </>
  );
}
