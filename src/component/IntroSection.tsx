"use client";

import React, { useMemo } from "react";
import Shuffle from "./Shuffle";

interface IntroStat {
  value: string;
  label: string;
}

interface IntroSectionProps {
  /** Section id — lets the banner's scroll arrow jump here. */
  id?: string;
  label?: string;
  /** Big animated heading. */
  heading?: string;
  /** Supporting paragraph under the heading. */
  description?: string;
  /** Words/phrases in the description to highlight in orange. */
  accentWords?: string[];
  /** Quick facts row. */
  stats?: IntroStat[];
  /** Tech chips at the bottom. */
  skills?: string[];
  className?: string;
}

/* ---------- defaults (from CV) — module-level so references stay stable ---------- */

const DEFAULT_HEADING =
  "I'm Jishnu — a MERN Stack Developer who builds fast, scalable and user-friendly web experiences.";

const DEFAULT_DESCRIPTION =
  "Junior Software Engineer at Mindstory, Thrissur. I build full-stack web applications with React, Next.js, Node.js and MongoDB, and craft custom Shopify and WordPress sites — from secure admin panels and Razorpay payments to smooth GSAP animations, for clients in India, the UAE and Northern Europe.";

const DEFAULT_ACCENT_WORDS = [
  "full-stack web applications",
  "Shopify",
  "WordPress",
  "Razorpay payments",
  "GSAP animations",
  "the UAE and Northern Europe",
];

const DEFAULT_STATS: IntroStat[] = [
  { value: "1.5+", label: "Years building for the web" },
  { value: "15+", label: "Projects built & shipped" },
  { value: "2", label: "International freelance clients" },
  { value: "2", label: "Companies worked with" },
];

const DEFAULT_SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "Angular",
  "Tailwind CSS",
  "GSAP",
  "Shopify (Liquid)",
  "WordPress",
  "Figma",
];

/* ---------- helpers ---------- */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits text into plain and highlighted segments in one pass (longest phrases matched first). */
function highlight(text: string, words: string[]) {
  const clean = words.map((w) => w.trim()).filter(Boolean);
  if (!clean.length) return [{ text, accent: false }];

  const pattern = clean
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  return text
    .split(regex)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      accent: clean.some((w) => w.toLowerCase() === part.toLowerCase()),
    }));
}

/* ---------- component ---------- */

export default function IntroSection({
  id = "intro",
  label = "// INTRO",
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
  accentWords = DEFAULT_ACCENT_WORDS,
  stats = DEFAULT_STATS,
  skills = DEFAULT_SKILLS,
  className = "",
}: IntroSectionProps) {
  const descriptionParts = useMemo(
    () => highlight(description, accentWords),
    [description, accentWords]
  );

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`w-full bg-black px-6 py-20 md:px-16 md:py-28 lg:px-24 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* label */}
        <p className="mb-10 font-mono text-xs uppercase tracking-widest text-[#e84020] md:mb-16 md:text-sm">
          {label}
        </p>

        {/* animated heading */}
        <div id={`${id}-heading`}>
          <Shuffle
            text={heading}
            tag="h2"
            className="text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ color: "white", textAlign: "left" }}
            shuffleDirection="right"
            shuffleTimes={2}
            duration={0.4}
            stagger={0.02}
            ease="power3.out"
            colorFrom="#ffffff"
            colorTo="#ffffff"
            triggerOnce
            triggerOnHover
            animationMode="evenodd"
            maxDelay={0.15}
          />
        </div>

        {/* supporting paragraph with highlighted phrases */}
        <p className="mt-10 max-w-3xl text-base leading-relaxed text-white/70 md:mt-14 md:text-lg">
          {descriptionParts.map((part, i) =>
            part.accent ? (
              <span key={i} className="font-medium text-[#e84020]">
                {part.text}
              </span>
            ) : (
              <React.Fragment key={i}>{part.text}</React.Fragment>
            )
          )}
        </p>

        {/* stats */}
        {stats.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/10 pt-10 md:mt-20 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-2">
                <dt className="text-xs uppercase tracking-wider text-white/50 md:text-sm">
                  {s.label}
                </dt>
                <dd className="text-4xl font-bold text-white md:text-5xl">
                  {s.value}
                  <span className="text-[#e84020]">.</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* skill chips */}
        {skills.length > 0 && (
          <ul className="mt-14 flex flex-wrap gap-3" aria-label="Tech stack">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-[#e84020]/60 px-4 py-2 text-xs font-medium text-[#e84020] transition-colors hover:bg-[#e84020] hover:text-black md:text-sm"
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}