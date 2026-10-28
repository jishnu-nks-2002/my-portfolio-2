"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import InfiniteSpiral, { type InfiniteSpiralItem, type InfiniteSpiralVideoSource } from "./InfiniteSpiral";

/* ---------- data (from CV) ---------- */

type ProjectStatus = "Live" | "In development" | "Freelance";

interface Project {
  title: string;
  type: string;
  status: ProjectStatus;
  stack: string[];
  description: string;
  url: string;
  /** Poster image. Defaults to the video's first frame (/projects/<name>.webp). */
  image?: string;
  /** Name of the recording in /public/projects/ (without extension). */
  video?: string;
}

/**
 * Live website screenshot via thum.io (free, no key).
 * For best speed, save real screenshots to /public/images/projects/ and set `image` on each project.
 */
const shot = (url: string) => `https://image.thum.io/get/width/1200/crop/750/${url}`;

/**
 * Each recording lives in /public/projects/ as five small files:
 *   <name>-m.webm / <name>-m.mp4   phones   (640px, 12s loop, ~150–400 KB)
 *   <name>.webm   / <name>.mp4     desktop  (1280px, 12s loop)
 *   <name>.webp                    poster — the first frame, shown instantly
 * WebM is smallest; MP4 is the fallback for iPhones/Safari that can't play it.
 */
const DIR = "/projects";
const MOBILE = "(max-width: 767px)";
const videoSources = (name: string): InfiniteSpiralVideoSource[] => [
  { src: `${DIR}/${name}-m.webm`, type: 'video/webm; codecs="vp9"', media: MOBILE },
  { src: `${DIR}/${name}-m.mp4`, type: "video/mp4", media: MOBILE },
  { src: `${DIR}/${name}.webm`, type: 'video/webm; codecs="vp9"' },
  { src: `${DIR}/${name}.mp4`, type: "video/mp4" },
];
const poster = (name: string) => `${DIR}/${name}.webp`;
const vid = (name: string) => name;

const PROJECTS: Project[] = [
  {
    title: "Inspire Education Service",
    type: "Full Stack",
    status: "Live",
    stack: ["Next.js", "Express", "MongoDB", "Razorpay"],
    description: "Education platform with a public site, an admin panel for courses and students, and Razorpay payments.",
    url: "https://www.inspireeducationservice.com/",
    video: vid("inspire"),
  },
  {
    title: "Ladder7 Next Solution",
    type: "Full Stack",
    status: "Live",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    description: "IT training & internship platform with fully editable, dynamic content management.",
    url: "https://ladder7.in/",
    video: vid("ladder7"),
  },
  {
    title: "Mother's Foods",
    type: "Shopify",
    status: "Live",
    stack: ["Shopify", "Liquid", "JavaScript"],
    description: "Food e-commerce store with custom Liquid product pages, tuned for SEO and performance.",
    url: "https://www.mothersfoods.in/",
    video: vid("mothers-foods"),
  },
  {
    title: "Tagsbikez",
    type: "Full Stack",
    status: "Live",
    stack: ["React", "Node.js", "MongoDB"],
    description: "MERN web app focused on a responsive UI and smooth, API-driven features.",
    url: "https://tagsbikez.com/",
    video: vid("tagsbikez"),
  },
  {
    title: "21Fiftyone",
    type: "Full Stack",
    status: "Live",
    stack: ["React", "Node.js", "Express"],
    description: "Modern, responsive web experience powered by a Node.js / Express backend.",
    url: "https://21fiftyone.com/",
    video: vid("21fiftyone"),
  },
  {
    title: "MPX Code",
    type: "Full Stack",
    status: "Live",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    description: "Full-stack platform built around a clean UI and a reliable backend architecture.",
    url: "https://mpxcode.com/",
    video: vid("mpxcode"),
  },
  {
    title: "Viral Cat Meow",
    type: "Frontend",
    status: "Live",
    stack: ["HTML", "CSS", "Bootstrap", "GSAP"],
    description: "Visually engaging, responsive website with smooth GSAP animations.",
    url: "https://viralcatmeow.com/",
    video: vid("viral-cat-meow"),
  },
  {
    title: "VCA Masterclass",
    type: "Frontend",
    status: "Live",
    stack: ["HTML", "CSS", "Bootstrap", "GSAP"],
    description: "Website for a digital marketing academy promoting its online courses.",
    url: "https://vcamasterclass.com/",
    video: vid("vca-masterclass"),
  },
  {
    title: "Kavalakat",
    type: "Full Stack",
    status: "Live",
    stack: ["Next.js", "Python", "Express"],
    description: "Full-stack web application with a Next.js frontend and Python / Express backend.",
    url: "https://kavalakat.com/",
    video: vid("kavalakat"),
  },
  {
    title: "Transindia",
    type: "Full Stack",
    status: "In development",
    stack: ["Next.js", "Python", "Express"],
    description: "Platform with a secure login portal, built on Next.js and a Python / Express backend.",
    url: "https://transindia-full.vercel.app/",
    video: vid("transindia"),
  },
  {
    title: "A-Roof / Aqua Star",
    type: "Full Stack",
    status: "In development",
    stack: ["Next.js", "Node.js", "Express"],
    description: "Full-stack web application built with Next.js and an Express / Node.js backend.",
    url: "https://new-aroof-emvh.vercel.app/",
    video: vid("a-roof"),
  },
  {
    title: "Empavai",
    type: "Freelance · UAE",
    status: "Freelance",
    stack: ["Next.js", "Node.js", "MongoDB"],
    description: "Freelance full-stack web app for a UAE-based client.",
    url: "https://nithyasoorya.vercel.app/",
    video: vid("empavai"),
  },
  {
    title: "Crock & Crumb",
    type: "Freelance · Northern Europe",
    status: "Freelance",
    stack: ["Next.js", "Node.js", "MongoDB"],
    description: "Freelance café website with a clean, responsive UI and dynamic backend.",
    url: "https://cafe-chi-cyan.vercel.app/",
    video: vid("crock-and-crumb"),
  },
 
];

// Module-level so the spiral gets a stable array.
// Posters are local and load instantly; the front card fades into its video once it arrives.
const SPIRAL_ITEMS: InfiniteSpiralItem[] = PROJECTS.map((p) => ({
  id: p.title,
  src: p.image ?? (p.video ? poster(p.video) : shot(p.url)),
  video: p.video ? videoSources(p.video) : undefined,
  alt: `${p.title} website`,
  label: p.title,
  href: p.url,
  target: "_blank",
}));

const STATUS_STYLE: Record<ProjectStatus, string> = {
  Live: "bg-green-500/15 text-green-400",
  "In development": "bg-yellow-500/15 text-yellow-300",
  Freelance: "bg-[#e84020]/15 text-[#ff7a5c]",
};

/* ---------- device / network ---------- */

/** Phones play only the front card (saves data + battery); Data Saver / 2G shows posters only. */
function useVideoMode() {
  const [mode, setMode] = useState({ mobile: false, videos: true });
  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void };
    }).connection;
    const update = () => {
      const slow = Boolean(conn?.saveData) || /(^|-)2g$/.test(conn?.effectiveType ?? "");
      setMode((prev) =>
        prev.mobile === mq.matches && prev.videos === !slow ? prev : { mobile: mq.matches, videos: !slow }
      );
    };
    update();
    mq.addEventListener("change", update);
    conn?.addEventListener?.("change", update);
    return () => {
      mq.removeEventListener("change", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);
  return mode;
}

/* ---------- responsive spiral size ---------- */

interface SpiralSize {
  cardWidth: number;
  cardHeight: number;
  radius: number;
  verticalSpacing: number;
  centerY: number;
  /** on-screen width of the front card (after its 1.2× + perspective boost) */
  frontWidth: number;
  /** details beside the card (desktop) or underneath (phones / tablets) */
  sides: boolean;
}

const PERSPECTIVE = 1200;
const SIDES_MIN_WIDTH = 1024;

/** Card size + spiral geometry from the screen size (cards are 16:9 like the recordings). */
function useSpiralSize(): SpiralSize {
  const [size, setSize] = useState<SpiralSize>({
    cardWidth: 400,
    cardHeight: 225,
    radius: 240,
    verticalSpacing: 135,
    centerY: 0.55,
    frontWidth: 640,
    sides: true,
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = Math.max(window.innerWidth >= SIDES_MIN_WIDTH ? 720 : 640, window.innerHeight);
      const sides = w >= SIDES_MIN_WIDTH;
      const phone = w < 768;
      // tighter spiral on desktop so neighbours tuck behind the front card instead of under the text
      const radius = Math.round(sides ? Math.min(200, w * 0.105) : phone ? w * 0.26 : w * 0.22);
      // the front card is drawn at centerScale (1.2) × the perspective boost of being nearest the viewer
      const frontScale = 1.2 * Math.min(1.45, PERSPECTIVE / (PERSPECTIVE - radius));
      const byHeight = ((h * (sides ? 0.5 : phone ? 0.28 : 0.34)) / frontScale) * (16 / 9);
      const byWidth = (w * (sides ? 0.44 : phone ? 0.9 : 0.6)) / frontScale;
      const cardWidth = Math.round(Math.min(sides ? 560 : 480, byHeight, byWidth));
      const cardHeight = Math.round((cardWidth * 9) / 16);
      const next: SpiralSize = {
        cardWidth,
        cardHeight,
        radius,
        verticalSpacing: Math.round(cardHeight * (sides ? 0.66 : 0.55)),
        centerY: sides ? 0.56 : phone ? 0.46 : 0.47,
        frontWidth: Math.round(cardWidth * frontScale),
        sides,
      };
      setSize((prev) =>
        prev.cardWidth === next.cardWidth &&
        prev.radius === next.radius &&
        prev.centerY === next.centerY &&
        prev.sides === next.sides
          ? prev
          : next
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

/* ---------- section ---------- */

interface ProjectsSectionProps {
  id?: string;
  label?: string;
  heading?: string;
  className?: string;
}

export default function ProjectsSection({
  id = "projects",
  label = "// PROJECTS",
  heading = "Things I've built",
  className = "",
}: ProjectsSectionProps) {
  const spiral = useSpiralSize();
  const videoMode = useVideoMode();
  const [active, setActive] = useState(0);

  // the details panel below follows whichever card is in the centre
  const handleChange = useCallback((index: number) => setActive(index), []);

  // progress bars follow the spiral's real autoplay clock (pause on drag / off screen)
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const handleAutoplay = useCallback((timing: { start: number; end: number } | null) => {
    const now = performance.now();
    barRefs.current.forEach((bar) => {
      if (!bar) return;
      if (!timing) {
        bar.style.transition = "transform 300ms ease";
        bar.style.transform = "scaleX(0)";
        return;
      }
      const from = Math.min(1, Math.max(0, (now - timing.start) / (timing.end - timing.start)));
      bar.style.transition = "none";
      bar.style.transform = `scaleX(${from})`;
      void bar.offsetWidth; // commit the start position before animating
      bar.style.transition = `transform ${Math.max(0, timing.end - now)}ms linear`;
      bar.style.transform = "scaleX(1)";
    });
  }, []);

  const project = PROJECTS[active] ?? PROJECTS[0];
  const nextProject = PROJECTS[(active + 1) % PROJECTS.length];
  const counter = `${String(active + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`;
  // clicking the front card opens the site
  const handleSelect = useCallback((index: number) => {
    const url = PROJECTS[index]?.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative isolate h-[100svh] min-h-[640px] w-full lg:min-h-[720px] overflow-hidden bg-[#0a0a0a] text-white ${className}`}
    >
      {/* full-screen 3D spiral — cards wind past, the front one plays its recording */}
      <div className="absolute inset-0">
        <InfiniteSpiral
          items={SPIRAL_ITEMS}
          mode="step"
          interval={3.5}
          glideSpeed={8}
          direction="up"
          animationMode="auto-drag"
          cardWidth={spiral.cardWidth}
          cardHeight={spiral.cardHeight}
          radius={spiral.radius}
          verticalSpacing={spiral.verticalSpacing}
          centerY={spiral.centerY}
          perspective={PERSPECTIVE}
          cardsPerTurn={7}
          cardRadius={14}
          centerScale={1.2}
          edgeFade={0.35}
          edgeBlur={5}
          dim={spiral.sides ? 0.68 : 0.55}
          pauseOnHover={false}
          videos={videoMode.videos}
          onActiveChange={handleChange}
          onSelect={handleSelect}
          onAutoplay={handleAutoplay}
        />
      </div>

      {/* heading — over the top of the carousel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pb-20 pt-24 md:pt-28">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 md:px-12 lg:max-w-[1600px] lg:px-10 xl:px-16">
          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:text-sm">
              {label}
            </p>
            <h2 id={`${id}-heading`} className="text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl">
              {heading}
              <span className="text-[#e84020]">.</span>
            </h2>
          </div>
          <p className="hidden font-mono text-xs uppercase tracking-widest text-white/40 md:block">
            Drag to spin · Click a card
          </p>
        </div>
      </div>

      {/* ---------- desktop: details beside the front card ---------- */}
      {spiral.sides && (
        <>
          {/* soft fades so the spiral's side cards sit behind the text, never over it */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[32%] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[32%] bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />

          <div
            className="pointer-events-none absolute inset-x-0 z-10 mx-auto grid max-w-[1600px] -translate-y-1/2 items-center px-10 xl:px-16"
            style={{
              top: `${spiral.centerY * 100}%`,
              gridTemplateColumns: `minmax(0,1fr) ${spiral.frontWidth + 64}px minmax(0,1fr)`,
            }}
          >
            {/* left — what it is */}
            <div key={`l-${active}`} className="max-w-sm animate-[projectInL_600ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
              <p className="font-mono text-6xl font-bold tabular-nums leading-none text-white/10 xl:text-7xl">
                {String(active + 1).padStart(2, "0")}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[project.status]}`}>
                  {project.status}
                </span>
                <span className="text-xs uppercase tracking-wider text-white/50">{project.type}</span>
              </div>
              <h3 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight xl:text-[2.75rem]">{project.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-white/60">{project.description}</p>
            </div>

            {/* centre — the card lives here */}
            <div />

            {/* right — how it's built + link */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs">
                <div key={`r-${active}`} className="animate-[projectInR_600ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
                  <p className="font-mono text-xs uppercase tracking-widest text-white/40">Built with</p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech used">
                    {project.stack.map((tech) => (
                      <li key={tech} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/75">
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="Visit"
                    className="group pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full bg-[#e84020] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Visit site
                    <ArrowUpRight
                      size={18}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </div>

                {/* autoplay clock */}
                <div className="mt-10">
                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-white/40">
                    <span className="whitespace-nowrap tabular-nums">{counter}</span>
                    <span className="truncate pl-4">Next · {nextProject.title}</span>
                  </div>
                  <div className="mt-3 h-px w-full overflow-hidden bg-white/10" aria-hidden="true">
                    <div
                      ref={(node) => {
                        barRefs.current[0] = node;
                      }}
                      className="h-full origin-left bg-[#e84020]"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- phones / tablets: details under the card ---------- */}
      {!spiral.sides && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pb-8 pt-24">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div
              key={active}
              className="flex animate-[projectIn_500ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col gap-4 motion-reduce:animate-none md:flex-row md:items-end md:justify-between md:gap-8"
            >
              <div className="max-w-2xl">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-white/50">{counter}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[project.status]}`}>
                    {project.status}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-white/50">{project.type}</span>
                </div>
                <h3 className="text-2xl font-bold md:text-4xl">{project.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/65 md:text-base">
                  {project.description}
                </p>
                <ul className="mt-3 hidden flex-wrap gap-2 sm:flex" aria-label="Tech used">
                  {project.stack.map((tech) => (
                    <li key={tech} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group pointer-events-auto inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#e84020] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black md:self-end"
              >
                Visit site
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="mt-6 h-px w-full overflow-hidden bg-white/10" aria-hidden="true">
              <div
                ref={(node) => {
                  barRefs.current[1] = node;
                }}
                className="h-full origin-left bg-[#e84020]"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes projectIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes projectInL { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes projectInR { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </section>
  );
}