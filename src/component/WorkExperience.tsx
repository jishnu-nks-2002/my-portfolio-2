"use client"

import React from "react";
import Shuffle from "./Shuffle";

interface ExperienceEntry {
  number: string;
  title: string;
  company: string;
  location: string;
  type: string;
  dateRange: string;
  duration: string;
  description: string;
  bullets: string[];
  tags: string[];
  ongoing?: boolean;
}

const experiences: ExperienceEntry[] = [
  {
    number: "01",
    title: "Jr. Software Engineer",
    company: "Mindstory",
    location: "Thrissur, Kerala",
    type: "Full-Time",
    dateRange: "Jun 2025 — Present",
    duration: "1+ year",
    description:
      "Mindstory is a growing digital marketing and IT solutions company focused on helping brands build a strong online presence.",
    bullets: [
      "Working on full-stack development using the MERN Stack (MongoDB, Express.js, React, Node.js) to build scalable and responsive web applications",
      "Developing and maintaining CMS-based websites using WordPress and Shopify, ensuring high performance and user-friendly design",
      "Collaborating with cross-functional teams to implement dynamic, data-driven features and optimize website performance",
      "Contributing to code reviews, version control (Git), and deployment processes to maintain clean and efficient codebases",
    ],
    tags: ["MERN Stack", "WordPress", "Shopify", "Git"],
    ongoing: true,
  },
  {
    number: "02",
    title: "MERN Stack (AEM) Intern",
    company: "Neyndra Global Solutions",
    location: "Kinfra Film and IT Park, Kazhakkoottam",
    type: "Full-Time",
    dateRange: "Mar 2025 — Jun 2025",
    duration: "4 months",
    description:
      "Neyndra is a startup IT consulting and services company.",
    bullets: [
      "Worked on full-stack web development using MongoDB, Express.js, Angular/React, and Node.js",
      "Gained hands-on experience integrating Adobe Experience Manager (AEM) for dynamic and scalable content management",
      "Collaborated with the development team on real-time projects, applying best practices in coding, version control, and deployment",
    ],
    tags: ["MongoDB", "Express.js", "React", "Node.js", "AEM"],
  },
];

const WorkExperience: React.FC = () => {
  return (
    <section className="w-full bg-[#0d0d0d] text-white px-6 py-20 sm:px-10 md:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Eyebrow */}
        <p className="mb-4 font-mono text-xs tracking-widest text-[#ff4d1c]">
          // WORK EXPERIENCE
        </p>

        {/* Heading */}
        <h2 className="mb-16 tracking-tight">
          <Shuffle
            text="Building Skills."
            tag="span"
            textAlign="left"
            className="block font-extrabold text-white"
            style={{
              textTransform: "none",
              fontSize: "clamp(2.25rem, 4.5vw, 3rem)",
              lineHeight: 1.15,
            }}
            shuffleDirection="right"
            duration={0.35}
            shuffleTimes={2}
            animationMode="evenodd"
            colorFrom="#555555"
            colorTo="#ffffff"
            triggerOnce
            triggerOnHover
          />
          <Shuffle
            text="One Project at a Time."
            tag="span"
            textAlign="left"
            className="block font-extrabold"
            style={{
              textTransform: "none",
              fontSize: "clamp(2.25rem, 4.5vw, 3rem)",
              lineHeight: 1.15,
              color: "#ff4d1c",
            }}
            shuffleDirection="right"
            duration={0.35}
            shuffleTimes={2}
            animationMode="evenodd"
            triggerOnce
            triggerOnHover
          />
        </h2>

        <div className="border-t border-white/10">
          {experiences.map((exp, idx) => (
            <div
              key={exp.number}
              className={`grid grid-cols-1 gap-6 py-10 md:grid-cols-[auto,1fr,auto] md:gap-10 ${
                idx !== experiences.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              {/* Number */}
              <div className="font-mono text-xs text-white/30 md:pt-1">
                {exp.number}
              </div>

              {/* Main content */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold sm:text-[26px]">
                    {exp.title}
                  </h3>
                  {exp.ongoing && (
                    <span className="h-2 w-2 rounded-full bg-[#ff4d1c] shadow-[0_0_8px_2px_rgba(255,77,28,0.6)]" />
                  )}
                </div>
                <p className="mt-1 text-sm text-white/50">
                  {exp.company} · {exp.location}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  {exp.description}
                </p>

                <ul className="mt-4 space-y-2">
                  {exp.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-white/70"
                    >
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff4d1c]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column: dates + tags */}
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="text-right">
                  <p className="font-mono text-xs text-[#ff4d1c]">
                    {exp.dateRange}
                  </p>
                  <p className="font-mono text-xs text-white/30">
                    {exp.duration} · {exp.type}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-white/15 px-2.5 py-1 text-[11px] text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;