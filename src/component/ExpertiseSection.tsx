"use client";

import React, { useEffect, useRef, useState } from "react";
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
import TiltCard from "./TiltCard";

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

// Stable references — a new array every render would make the fluid re-read its colours.
const FLUID_COLORS = ["#e84020", "#c8280c", "#ff8a6b"];
const BG = "#f4f3f1";

/* ---------- performance helpers ---------- */

/**
 * Fluid on every screen size, rendered to a fixed pixel budget.
 * It covers the whole section, but the render resolution is scaled so the canvas stays within
 * the budget whatever the screen size or pixel ratio — smaller on phones to save battery.
 * (Reduced-motion users still see it: the fluid component freezes its own motion for them.)
 */
const PIXEL_BUDGET = 1_100_000;
const PHONE_BUDGET = 550_000;

function useFluidBudget<T extends Element>(ref: React.RefObject<T | null>) {
  const [mode, setMode] = useState({ enabled: false, dpr: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const capable = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const css = Math.max(1, width * height);
      const budget = capable.matches ? PIXEL_BUDGET : PHONE_BUDGET;
      // round to 0.05 steps so tiny height changes don't keep resizing the canvas
      const dpr = Math.round(Math.min(1, Math.max(0.45, Math.sqrt(budget / css))) * 20) / 20;
      const enabled = true;
      setMode((prev) => (prev.enabled === enabled && prev.dpr === dpr ? prev : { enabled, dpr }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    capable.addEventListener("change", update);
    return () => {
      ro.disconnect();
      capable.removeEventListener("change", update);
    };
  }, [ref]);
  return mode;
}

/**
 * When to create the WebGL fluid. Compiling its shaders is a one-off hitch, so we do it
 * while the browser is idle after the page has loaded — not while you're scrolling into
 * the section. If you scroll there fast, it starts as soon as the section is getting close.
 */
function useMountWhenIdle<T extends Element>(ref: React.RefObject<T | null>) {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (mount) return;
    const el = ref.current;
    let idleId = 0;
    let timer = 0;
    const go = () => setMount(true);

    const scheduleIdle = () => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(go, { timeout: 3000 });
      else timer = window.setTimeout(go, 1200);
    };
    if (document.readyState === "complete") scheduleIdle();
    else window.addEventListener("load", scheduleIdle, { once: true });

    const io = el
      ? new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: "1200px 0px" })
      : null;
    if (el && io) io.observe(el);

    return () => {
      window.removeEventListener("load", scheduleIdle);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, [ref, mount]);
  return mount;
}

/** True while the section is on screen (used to fade the fluid in once it's ready). */
function useInView<T extends Element>(ref: React.RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/* ---------- section ---------- */

interface ExpertiseSectionProps {
  id?: string;
  label?: string;
  heading?: string;
  categories?: SkillCategory[];
  /** Turn the ferrofluid background off. */
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

  const fluidMode = useFluidBudget(rootRef);
  const mounted = useMountWhenIdle(rootRef);
  const inView = useInView(rootRef);
  const renderFluid = showFluid && fluidMode.enabled && mounted;
  const [fluidShown, setFluidShown] = useState(false);

  // Fade the fluid in shortly after it first becomes visible, so its first frames never pop.
  useEffect(() => {
    if (!renderFluid || !inView || fluidShown) return;
    const t = window.setTimeout(() => setFluidShown(true), 120);
    return () => window.clearTimeout(t);
  }, [renderFluid, inView, fluidShown]);

  // Header and cards rise in once. clearProps leaves no transforms behind afterwards.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".expertise-head > *", {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ".expertise-head", start: "top 85%", once: true },
        });
        gsap.from(".expertise-card", {
          autoAlpha: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          force3D: true,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: ".expertise-grid", start: "top 85%", once: true },
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
      className={`relative isolate w-full overflow-hidden ${className}`}
      style={{ backgroundColor: BG }}
    >
      {/* ---------- background ----------
          Covers the whole section. Kept light by a fixed pixel budget (see useFluidBudget),
          a 30fps cap, idle-time setup, and pausing whenever the section is off screen. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* soft static glow — shown while the fluid loads (or if WebGL isn't available) */}
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#e84020]/10 blur-[120px]" />

        {renderFluid && (
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: fluidShown ? 1 : 0 }}
          >
            <Ferrofluid
              lightMode
              colors={FLUID_COLORS}
              transparent={false}
              color={BG}
              dpr={fluidMode.dpr}
              maxFps={30}
              brightness={1.2}
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
              clickPulse={false}
              intro={false}
            />
            {/* light wash so text stays crisp over the fluid */}
            <div className="absolute inset-0" style={{ backgroundColor: `${BG}1a` }} />
          </div>
        )}
      </div>

      {/* fades into the neighbouring sections */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40"
        style={{ background: `linear-gradient(to bottom, ${BG}, ${BG}00)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: `linear-gradient(to top, ${BG}, ${BG}00)` }}
      />

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
                <TiltCard
                  key={cat.number}
                  className={`expertise-card ${cat.span ?? ""}`}
                  cardClassName="p-6 md:p-8"
                >
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