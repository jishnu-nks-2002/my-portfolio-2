"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MapPin, ArrowUpRight } from "lucide-react";
import TiltCard from "./TiltCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- data (from CV) ---------- */

interface ExperienceEntry {
  number: string;
  title: string;
  company: string;
  location: string;
  type: string;
  /** "YYYY-MM" — leave out when there's no fixed start (shows "Ongoing") */
  start?: string;
  /** "YYYY-MM" — leave out for a current role */
  end?: string;
  description: string;
  bullets: string[];
  tags: string[];
}

const EXPERIENCES: ExperienceEntry[] = [
  {
    number: "01",
    title: "Jr. Software Engineer",
    company: "Mindstory",
    location: "Thrissur, Kerala",
    type: "Full-Time",
    start: "2025-06",
    description:
      "A growing digital marketing and IT solutions company helping brands build a strong online presence.",
    bullets: [
      "Build scalable, responsive web apps on the MERN stack (MongoDB, Express.js, React, Node.js)",
      "Develop and maintain WordPress and Shopify sites with a focus on performance and usability",
      "Ship data-driven features and API integrations with cross-functional teams",
      "Take part in code reviews, Git workflows and deployments",
    ],
    tags: ["MERN Stack", "Next.js", "WordPress", "Shopify", "Git"],
  },
  {
    number: "02",
    title: "Freelance Full-Stack Developer",
    company: "Independent",
    location: "Remote · UAE & Northern Europe",
    type: "Freelance",
    description: "Full-stack web apps for international clients, alongside my full-time role.",
    bullets: [
      "Empavai — full-stack web app for a UAE-based client",
      "Crock & Crumb — café website with a clean UI and dynamic backend for a Northern Europe client",
    ],
    tags: ["Next.js", "Node.js", "MongoDB"],
  },
  {
    number: "03",
    title: "MERN Stack (AEM) Intern",
    company: "Neyndra Global Solutions",
    location: "Kinfra Film and IT Park, Kazhakkoottam",
    type: "Internship",
    start: "2025-03",
    end: "2025-06",
    description: "A startup IT consulting and services company.",
    bullets: [
      "Full-stack development with MongoDB, Express.js, Angular / React and Node.js",
      "Integrated Adobe Experience Manager (AEM) for scalable content management",
      "Worked on real-time projects using best practices for code, version control and deployment",
    ],
    tags: ["MongoDB", "Express.js", "React", "Angular", "AEM"],
  },
];

/* ---------- date helpers ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseYM = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return { y, m };
};

const formatYM = (ym: string) => {
  const { y, m } = parseYM(ym);
  return `${MONTHS[m - 1]} ${y}`;
};

/** Inclusive month count, e.g. Mar–Jun = 4 mos. Current roles count up to this month. */
const durationLabel = (start: string, end?: string) => {
  const a = parseYM(start);
  const now = new Date();
  const b = end ? parseYM(end) : { y: now.getFullYear(), m: now.getMonth() + 1 };
  const total = Math.max(1, (b.y - a.y) * 12 + (b.m - a.m) + 1);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ");
};

/* ---------- section ---------- */

interface WorkExperienceProps {
  id?: string;
  label?: string;
  experiences?: ExperienceEntry[];
  email?: string;
  className?: string;
}

const BG = "#f4f3f1";

export default function WorkExperience({
  id = "experience",
  label = "// WORK EXPERIENCE",
  experiences = EXPERIENCES,
  email = "jishnunarayanan2002@gmail.com",
  className = "",
}: WorkExperienceProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // heading words rise in once
        gsap.from(".work-word", {
          autoAlpha: 0,
          y: 28,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
          clearProps: "transform",
          scrollTrigger: { trigger: ".work-head", start: "top 85%", once: true },
        });

        // orange progress line fills as you scroll through the timeline
        gsap.fromTo(
          ".work-progress",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".work-timeline",
              start: "top 65%",
              end: "bottom 65%",
              scrub: 0.5,
            },
          }
        );

        gsap.utils.toArray<HTMLElement>(".work-item").forEach((item) => {
          // timeline dot lights up as the line reaches it
          ScrollTrigger.create({ trigger: item, start: "top 65%", toggleClass: "is-active" });

          // card slides in once
          gsap.from(item.querySelector(".work-card"), {
            autoAlpha: 0,
            x: 40,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: item, start: "top 85%", once: true },
          });
        });
      });

      // reduced motion: show everything in its final state
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".work-progress", { scaleY: 1 });
        gsap.utils.toArray<HTMLElement>(".work-item").forEach((el) => el.classList.add("is-active"));
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative w-full overflow-clip px-6 py-20 md:px-12 md:py-28 lg:px-16 ${className}`}
      style={{ backgroundColor: BG }}
    >
      {/* subtle dot grid, fading out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[5fr_7fr] lg:gap-20">
        {/* ---------- left: sticky intro ---------- */}
        <div className="work-head self-start lg:sticky lg:top-28">
          <p className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:text-sm">
            {label}
          </p>

          <h2
            id={`${id}-heading`}
            className="text-4xl font-bold leading-[1.1] tracking-tight text-black md:text-6xl"
          >
            <span className="work-word inline-block">Building</span>{" "}
            <span className="work-word inline-block">skills,</span>{" "}
            <span className="work-word inline-block font-serif font-normal italic text-[#e84020]">one</span>{" "}
            <span className="work-word inline-block font-serif font-normal italic text-[#e84020]">project</span>{" "}
            <span className="work-word inline-block">at</span>{" "}
            <span className="work-word inline-block">a</span>{" "}
            <span className="work-word inline-block">time.</span>
          </h2>
          <span aria-hidden="true" className="mt-7 block h-1 w-16 rounded-full bg-[#e84020]" />

          <p className="mt-8 max-w-md text-base leading-relaxed text-neutral-600 md:text-lg">
            From an AEM internship to building full-stack products and stores for clients across
            India, the UAE and Northern Europe.
          </p>

          {/* quick stats */}
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { value: "1.5+", label: "Years" },
              { value: String(experiences.length).padStart(2, "0"), label: "Roles" },
              { value: "15+", label: "Projects" },
            ].map((s) => (
              <div key={s.label}>
                <dd className="text-3xl font-bold text-black md:text-4xl">
                  {s.value}
                  <span className="text-[#e84020]">.</span>
                </dd>
                <dt className="mt-1 text-xs uppercase tracking-wider text-neutral-500">{s.label}</dt>
              </div>
            ))}
          </dl>

          <a
            href={`mailto:${email}`}
            data-cursor-label="Mail"
            className="group/cta mt-10 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e84020]"
          >
            Let&apos;s work together
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
            />
          </a>
        </div>

        {/* ---------- right: timeline ---------- */}
        <ol className="work-timeline relative pl-10 md:pl-14">
          {/* track + scroll-driven orange fill */}
          <span aria-hidden="true" className="absolute bottom-4 left-[11px] top-4 w-[2px] rounded-full bg-black/10" />
          <span
            aria-hidden="true"
            className="work-progress absolute bottom-4 left-[11px] top-4 w-[2px] origin-top scale-y-0 rounded-full bg-[#e84020]"
          />

          {experiences.map((exp, i) => {
            const ongoing = !exp.end;
            const dateText = exp.start
              ? `${formatYM(exp.start)} — ${ongoing ? "Present" : formatYM(exp.end!)}`
              : "Ongoing";
            return (
              <li key={exp.number} className={`work-item group/item relative ${i < experiences.length - 1 ? "mb-8" : ""}`}>
                {/* timeline dot */}
                <span
                  aria-hidden="true"
                  className="absolute -left-10 top-9 grid h-6 w-6 place-items-center rounded-full bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)] md:-left-14"
                >
                  {ongoing && (
                    <span className="absolute inset-0 rounded-full bg-[#e84020]/30 motion-safe:animate-ping" />
                  )}
                  <span className="relative h-2.5 w-2.5 rounded-full bg-neutral-300 transition-colors duration-500 group-[.is-active]/item:bg-[#e84020]" />
                </span>

                <TiltCard className="work-card" cardClassName="p-6 md:p-8" maxTilt={5}>
                  {/* big faded number — back layer */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-6 top-4 select-none text-7xl font-bold leading-none text-neutral-100 transition-colors duration-500 [transform:translateZ(10px)] group-hover:text-[#e84020]/15 md:text-8xl"
                  >
                    {exp.number}
                  </span>

                  <div className="relative [transform-style:preserve-3d]">
                    {/* dates — front layer */}
                    <div className="mb-5 flex flex-wrap items-center gap-3 [transform:translateZ(45px)]">
                      <span className="rounded-full bg-[#e84020] px-3 py-1 font-mono text-xs text-white shadow-[0_8px_18px_-8px_rgba(232,64,32,0.7)]">
                        {dateText}
                      </span>
                      <span className="font-mono text-xs text-neutral-500" suppressHydrationWarning>
                        {exp.start ? `${durationLabel(exp.start, exp.end)} · ` : ""}
                        {exp.type}
                      </span>
                    </div>

                    {/* title — middle layer */}
                    <div className="[transform:translateZ(32px)]">
                      <h3 className="text-2xl font-bold text-black md:text-[28px]">{exp.title}</h3>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
                        <span className="font-semibold text-black">{exp.company}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} aria-hidden="true" /> {exp.location}
                        </span>
                      </p>
                    </div>

                    {/* description + bullets — slightly raised */}
                    <div className="mt-5 [transform:translateZ(18px)]">
                      <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                        {exp.description}
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {exp.bullets.map((b) => (
                          <li key={b} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
                            <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#e84020]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* tags */}
                    <ul className="mt-6 flex flex-wrap gap-2 [transform:translateZ(24px)]" aria-label="Tech used">
                      {exp.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-200 hover:bg-[#e84020] hover:text-white"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}