"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Monitor,
  Server,
  ShoppingBag,
  PenTool,
  Wrench,
  Users,
  type LucideIcon,
} from "lucide-react";
import Ferrofluid from "./Ferrofluid";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- data (from CV) ---------- */

interface SkillCategory {
  number: string;
  name: string;
  blurb: string;
  icon: LucideIcon;
  skills: string[];
  /** Bento grid placement on large screens. */
  span?: string;
}

const DEFAULT_CATEGORIES: SkillCategory[] = [
  {
    number: "01",
    name: "Frontend",
    blurb: "Responsive, animated interfaces that feel fast.",
    icon: Monitor,
    skills: [
      "React",
      "Next.js",
      "Angular",
      "JavaScript",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Bootstrap",
      "Material UI",
      "GSAP",
      "Axios",
    ],
    span: "lg:col-span-2",
  },
  {
    number: "02",
    name: "Backend",
    blurb: "APIs, auth and data that scale with the product.",
    icon: Server,
    skills: [
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "RESTful APIs",
      "JWT Auth",
      "Bcrypt.js",
      "CORS",
      "Middleware",
      "MVC",
      "Python",
      "Razorpay",
    ],
    span: "lg:row-span-2",
  },
  {
    number: "03",
    name: "CMS & Commerce",
    blurb: "Custom stores and sites clients can manage.",
    icon: ShoppingBag,
    skills: ["Shopify", "Liquid", "WordPress", "SEO", "Performance"],
  },
  {
    number: "04",
    name: "Design",
    blurb: "Design roots — from mockup to pixel-perfect build.",
    icon: PenTool,
    skills: ["Figma", "Photoshop", "Illustrator", "UI/UX"],
  },
  {
    number: "05",
    name: "Tools & Deployment",
    blurb: "Clean workflows from first commit to production.",
    icon: Wrench,
    skills: [
      "Git",
      "GitHub",
      "VS Code",
      "Postman",
      "Chrome DevTools",
      "Firebase",
      "Vercel",
      "Netlify",
      "Railway",
    ],
    span: "lg:col-span-2",
  },
  {
    number: "06",
    name: "Soft Skills",
    blurb: "How I work with teams and clients.",
    icon: Users,
    skills: ["Communication", "Teamwork", "Problem-Solving", "Leadership", "Adaptability", "Time Management"],
  },
];

/* ---------- 3D tilt card ----------
 * No borders — depth comes from soft shadows and layers.
 * The card tilts toward the mouse; icon, title and chips sit at different
 * depths (translateZ) so they shift against each other as it tilts.
 * Mouse-only; flat on touch screens and with reduced motion.
 */

function TiltCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!wrap || !card || !glare) return;

    const canTilt =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt) return;

    const MAX_DEG = 8;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let gx = 50;
    let gy = 50;
    let raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      card.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.7), rgba(255,255,255,0) 50%)`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      tx = (nx - 0.5) * 2 * MAX_DEG;
      ty = -(ny - 0.5) * 2 * MAX_DEG;
      gx = nx * 100;
      gy = ny * 100;
      glare.style.opacity = "1";
      start();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      glare.style.opacity = "0";
      start();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    // outer wrapper: perspective + entrance animation target (kept separate from the tilt transform)
    <div ref={wrapRef} className={`expertise-card group [perspective:1200px] ${className}`}>
      <div
        ref={cardRef}
        className="relative h-full rounded-3xl bg-white/90 p-6 [transform-style:preserve-3d] will-change-transform md:p-8
          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]
          transition-shadow duration-500
          group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_40px_70px_-24px_rgba(232,64,32,0.35),0_24px_40px_-24px_rgba(0,0,0,0.25)]"
      >
        {/* glare */}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 mix-blend-soft-light transition-opacity duration-300 [transform:translateZ(1px)]"
        />
        {children}
      </div>
    </div>
  );
}

/* ---------- section ---------- */

interface ExpertiseSectionProps {
  id?: string;
  label?: string;
  heading?: string;
  categories?: SkillCategory[];
  /** Turn the ferrofluid background off (plain black). */
  showFluid?: boolean;
  className?: string;
}

export default function ExpertiseSection({
  id = "expertise",
  label = "// EXPERTISE & SKILLS",
  heading = "The stack I build with.",
  categories = DEFAULT_CATEGORIES,
  showFluid = true,
  className = "",
}: ExpertiseSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const total = categories.reduce((n, c) => n + c.skills.length, 0);

  // Header and cards rise in once when scrolled into view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".expertise-head > *", {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".expertise-head", start: "top 85%", once: true },
        });
        gsap.from(".expertise-card", {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".expertise-grid", start: "top 80%", once: true },
        });
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
      className={`relative isolate w-full overflow-hidden bg-[#f4f3f1] ${className}`}
    >
      {/* ferrofluid background — light "paper" mode on off-white, shaded in red */}
      {showFluid && (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Ferrofluid
            lightMode
            colors={["#e84020", "#e84020", "#ff8a6b"]}
            transparent={false}
            color="#f4f3f1"
            brightness={1}
            speed={0.4}
            scale={1.6}
            spikeHeight={1}
            sharpness={2.5}
            turbulence={1}
            fluidity={0.5}
            tilt={48}
            magnetism={1}
            flowDirection="down"
            mouseInteraction
            mouseStrength={1}
            mouseRadius={0.22}
            clickPulse
            intro
          />
          {/* darken top/bottom so it blends into the next sections and keeps text readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f4f3f1] via-[#f4f3f1]/20 to-[#f4f3f1]" />
        </div>
      )}

      <div className="relative px-6 py-20 md:px-12 md:py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* header */}
          <div className="expertise-head mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:text-sm">
                {label}
              </p>
              <h2
                id={`${id}-heading`}
                className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-black md:text-6xl"
              >
                {heading}
              </h2>
            </div>

            <div className="flex gap-10">
              <div>
                <p className="text-4xl font-bold text-black md:text-5xl">
                  {String(categories.length).padStart(2, "0")}
                  <span className="text-[#e84020]">.</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">Areas</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-black md:text-5xl">
                  {total}
                  <span className="text-[#e84020]">+</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">Tools & skills</p>
              </div>
            </div>
          </div>

          {/* bento grid */}
          <div className="expertise-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TiltCard key={cat.number} className={cat.span ?? ""}>
                  {/* big faded number — back layer */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-6 top-4 select-none text-7xl font-bold leading-none text-neutral-100 transition-colors duration-500 [transform:translateZ(10px)] group-hover:text-[#e84020]/15 md:text-8xl"
                  >
                    {cat.number}
                  </span>

                  <div className="relative flex h-full flex-col [transform-style:preserve-3d]">
                    {/* icon — front-most layer */}
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e84020] text-white shadow-[0_10px_24px_-8px_rgba(232,64,32,0.6)] [transform:translateZ(50px)]">
                      <Icon size={22} aria-hidden="true" />
                    </div>

                    {/* title + blurb — middle layer */}
                    <div className="[transform:translateZ(35px)]">
                      <p className="mb-1 font-mono text-xs text-[#e84020]">{cat.number}</p>
                      <h3 className="text-xl font-semibold text-black md:text-2xl">{cat.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{cat.blurb}</p>
                    </div>

                    {/* chips — slightly raised */}
                    <ul
                      className="mt-6 flex flex-wrap gap-2 [transform:translateZ(20px)]"
                      aria-label={`${cat.name} skills`}
                    >
                      {cat.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors duration-200 hover:bg-[#e84020] hover:text-white md:text-sm"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}