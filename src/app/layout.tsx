import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Diamond Sports Academy | Elite Athlete Training",
    template: "%s | The Diamond Sports Academy",
  },
  description:
    "Elite athlete training in Odenton, MD. Baseball, softball, speed & agility, golf simulator, weight training. Building better ballplayers since 2022.",
  keywords: [
    "baseball training",
    "softball training",
    "sports academy",
    "Odenton MD",
    "baseball camps",
    "pitching lessons",
    "hitting lessons",
    "HitTrax",
    "Rapsodo",
  ],
  openGraph: {
    title: "The Diamond Sports Academy",
    description: "Train the Mind. Build the Body. Master the Game.",
    url: "https://thediamondsportsacademy.com",
    siteName: "The Diamond Sports Academy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${figtree.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
