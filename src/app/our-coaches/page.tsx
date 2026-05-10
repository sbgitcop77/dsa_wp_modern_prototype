import type { Metadata } from "next";
import Image from "next/image";
import CtaBanner from "@/components/CtaBanner";

export const metadata: Metadata = {
  title: "Our Coaches",
  description:
    "Meet the expert coaching staff at The Diamond Sports Academy — former collegiate and professional athletes dedicated to developing the next generation of players.",
};

type ContentBlock = string | { heading: string; items: string[] } | string[];

interface Coach {
  name: string;
  title: string;
  subtitle: string;
  content: ContentBlock[];
}

const COACHES: Coach[] = [
  {
    name: "Chris Ford",
    title: "Owner & Founder",
    subtitle: "Former Division I Catcher & Professional Player",
    content: [
      "Chris Ford grew up in Gambrills, Maryland, attending Arundel High School where he was recognized as the No. 272-ranked catcher nationally and No. 2-ranked in Maryland. Named a Preseason All-American in 2015, he committed to Norfolk State University.",
      "At Norfolk State, Chris appeared in 30 games as a freshman in 2016 with a .228 batting average and five caught stealing. Over 2016-2017, he maintained a .986 fielding percentage with a 33% caught-stealing rate, helping lead Norfolk State to back-to-back Northern Division Conference titles.",
      "In 2018, Chris transferred to Rogers State University Division II program, batting .273 with a .455 slugging percentage. In 2019, he led the conference in defensive catching categories with a .987 fielding percentage and 35% caught-stealing rate.",
      "Chris began his professional career in 2019 with the White Sands Pupfish of the Pecos League, later training with the Black Sox and Washington Wild Things. He earned invitations to workouts with the Boston Red Sox, New York Mets, Milwaukee Brewers, and Texas Rangers. In 2020, he received a Spring Training invitation from the Detroit Tigers before COVID-19 halted the season.",
      "After retiring, Chris founded The Baseball Doctor in 2022, specializing in catching, hitting, velocity training, baseball IQ, softball hitting, and athletic performance. In 2025, he opened The Diamond Sports Academy.",
    ],
  },
  {
    name: "Syeed Mahdi",
    title: "Hitting & Fielding Instructor",
    subtitle: "Former Division I & II Standout · All-Region Selection",
    content: [
      "A former Division I (Norfolk State) and Division II (Shepherd University) standout, Sy Mahdi brings high-level playing experience and passion for player development.",
      {
        heading: "2019 Senior Season:",
        items: [
          "First Team All-MEC",
          "Second Team D2CCA All-Atlantic Region",
          "Second Team NCBWA All-Atlantic Region",
          "47 games: .341 batting average, 13 home runs, 50 RBIs, 29 runs scored, 12 stolen bases",
          "MEC Player of the Week and NCBWA Atlantic Region Player of the Week honors",
        ],
      },
      {
        heading: "Norfolk State University (2015–2018):",
        items: [
          "2018 (Junior): Started 47 of 48 games, finished second in home runs and third in stolen bases",
          "2017 (Redshirt): Season cut short by injury; 3-for-4 game with home run vs. Villanova",
          "2016 (Sophomore): Tied for team lead in home runs (5), second in RBIs (32)",
          "2015 (Freshman): .279 batting average, 15 RBIs, seven stolen bases",
          "Multiple MEAC All-Academic awards and NSU Athletics Director's Honor Roll",
        ],
      },
      {
        heading: "High School & Early Career:",
        items: [
          "Four-year varsity letterwinner and preseason all-state selection, hitting .400 as a senior with three home runs and 17 RBIs. Earned Team Maryland MVP honors during travel ball.",
        ],
      },
      "At The Diamond Sports Academy, Sy focuses on hitting and fielding development, game IQ, and situational awareness.",
    ],
  },
  {
    name: "Connor Hax",
    title: "Baseball Instructor",
    subtitle: "Former NCAA Division I Player · UMBC Baseball",
    content: [
      "With over five years of coaching experience and a strong collegiate playing background, Connor brings a well-rounded and passionate approach to player development. He currently serves as a baseball instructor at The Diamond, working with athletes of all skill levels for the last two and a half years.",
      "Before joining The Diamond, Connor provided two years of private instruction helping players refine fundamentals and grow confidence.",
      "A former NCAA Division I athlete and Bishop McNamara alum, Connor played four years of baseball at the University of Maryland, Baltimore County (UMBC). During his time at UMBC, he worked as a camp instructor and coordinator for three years.",
      "He further expanded his coaching resume with three years at Athletic Performance Inc. (API), coaching players ages 13–15 with focus on skill development and game preparation.",
      "Connor emphasizes fundamentals, baseball IQ, and strong work ethic, tailoring instruction to each athlete.",
    ],
  },
  {
    name: "Alison Guckin",
    title: "Softball Instructor",
    subtitle: "2× All-MEAC Outfielder · NSU Stolen Base Record Holder",
    content: [
      {
        heading: "Norfolk State Softball '19–'23:",
        items: [
          "2× All-MEAC Second Team (Outfield)",
          "NSU single-season stolen base record holder",
          "Finished 11th in NCAA Division I for stolen bases",
          "Played in Australia in 2023 with Beyond Sports",
          "Assistant Coach for MD Integrity 13u",
        ],
      },
      "Alison's coaching journey began in 2022 when her 10-year-old cousin asked for batting and catching lessons. After rediscovering her passion, she committed fully to coaching and helping young athletes grow.",
    ],
  },
  {
    name: "Kody Hines",
    title: "Baseball Coach",
    subtitle: "16+ Years Coaching Experience · Spalding / AACC / Frostburg",
    content: [
      "Kody Hines is an experienced baseball coach with more than 16 years of coaching and private instruction experience. A four-year varsity starter at Archbishop Spalding High School, he continued his playing career at Anne Arundel Community College before attending Frostburg State University, where he also served as an assistant coach.",
      "Over his career, he has coached at:",
      [
        "Archbishop Spalding High School",
        "Anne Arundel Community College",
        "Frostburg State University",
        "St. Mary's High School",
        "Broadneck High School",
      ],
      "Kody focuses on fundamentals, exit velocity, confidence-building, and strong work ethic—both on and off the field.",
    ],
  },
  {
    name: "Richard Cosgrove",
    title: "Player Development Coach",
    subtitle: "Baltimore Orioles Player Development · Former Padres Organization",
    content: [
      "Richard Cosgrove is entering his fifth season in player development with the Baltimore Orioles and his sixth year in professional baseball, after beginning his career with the San Diego Padres in 2021.",
      "He has worked across multiple minor league levels and was part of the 2023 Triple-A National Champion Norfolk Tides, a roster featuring several current and future MLB players.",
      "Before coaching professionally, Richard played collegiately as a three-year varsity starter, Anne Arundel All-County selection, and MSABC Futures All-Star. His early coaching stops included Phoenixville High School and Lackawanna College, where he contributed to a Junior College World Series run.",
    ],
  },
  {
    name: "Jenny Parsons",
    title: "Elite Softball Coach",
    subtitle: "Hall of Fame NCAA Athlete & Award-Winning Division I Coach",
    content: [
      "Jenny Parsons is a nationally recognized coach and former NCAA Division I athlete with more than 30 years of experience. She now provides elite-level player development training after retiring from collegiate coaching.",
      "A three-sport Anne Arundel County legend, Jenny earned First-Team All-County and Capital Gazette Player of the Year in volleyball, basketball, and softball.",
      "At East Carolina University, she earned all-conference honors in both volleyball and softball and graduated holding ECU pitching records for:",
      [
        "ERA (1.52)",
        "Innings pitched (969.1)",
        "Wins (102)",
        "Shutouts (34)",
      ],
      "Jenny spent more than 20 years coaching at the collegiate level:",
      [
        "10 seasons at Nicholls",
        "14 seasons at Central Arkansas",
      ],
      "In 2023, she led UCA to a record-setting 45 wins, ASUN titles, and an NCAA Tournament victory, earning ASUN Coach of the Year and NCAA Mid-Major Coach of the Year honors.",
      "Jenny now focuses on pitching, defense, and advanced player development for athletes preparing for high-level competition.",
    ],
  },
  {
    name: "John Dopson",
    title: "Pitching Coach",
    subtitle: "Former MLB Pitcher · Montreal Expos & Boston Red Sox",
    content: [
      "John Dopson is a former Major League Baseball pitcher best known for his time with the Montreal Expos and Boston Red Sox during the late 1980s and early 1990s.",
      "Born in Baltimore, Dopson debuted with the Expos in 1985 before joining the Red Sox in 1988, where he became a key part of their rotation. His 1989 season included more than 180 innings pitched.",
      "Known for command and precision, Dopson appeared in more than 100 MLB games before retiring.",
      "After his playing career, he transitioned into instruction and youth development, helping players refine their pitching skills with professional-level insight.",
    ],
  },
];

function renderContent(block: ContentBlock, idx: number) {
  if (typeof block === "string") {
    return <p key={idx} className="text-[#6c757d] text-sm leading-relaxed">{block}</p>;
  }
  if (Array.isArray(block)) {
    return (
      <ul key={idx} className="list-disc list-inside space-y-1 text-[#6c757d] text-sm">
        {block.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
      </ul>
    );
  }
  // heading + items
  return (
    <div key={idx}>
      <p className="text-[#212529] text-sm font-semibold mt-2 mb-1">{block.heading}</p>
      <ul className="list-disc list-inside space-y-1 text-[#6c757d] text-sm">
        {block.items.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
      </ul>
    </div>
  );
}

export default function CoachesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-[#00141B] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#f33b41] text-sm font-semibold uppercase tracking-widest mb-3">Our Team</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Meet Our Coaches</h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Elite Trainers, Proven Results. Our staff brings collegiate and professional experience to every session.
          </p>
        </div>
      </section>

      {/* Coaches grid */}
      <section className="bg-[#F7F7F7] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {COACHES.map((c) => (
              <div key={c.name} className="bg-white border border-gray-200 rounded-xl p-7 hover:border-[#337C99]/40 hover:shadow-md transition-all">
                <div className="flex gap-5 mb-4">
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src="/images/placeholder-diamond-team-member-300x300.webp"
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[#212529] font-bold text-xl mb-0.5">{c.name}</h2>
                    <p className="text-[#337C99] text-sm font-semibold mb-1">{c.title}</p>
                    <p className="text-[#6c757d] text-xs italic">{c.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {c.content.map((block, idx) => renderContent(block, idx))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
