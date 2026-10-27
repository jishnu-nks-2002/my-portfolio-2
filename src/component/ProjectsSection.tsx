"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import CircularCarousel, { type CircularCarouselItem } from "./CircularCarousel";

/* ---------- data (from CV) ---------- */

type ProjectStatus = "Live" | "In development" | "Freelance";

interface Project {
  title: string;
  type: string;
  status: ProjectStatus;
  stack: string[];
  description: string;
  url: string;
  /** Poster / fallback image. Defaults to a live screenshot of `url`. */
  image?: string;
  /** Short muted screen recording that loops on the card (mp4). */
  video?: string;
}

/**
 * Live website screenshot via thum.io (free, no key).
 * For best speed, save real screenshots to /public/images/projects/ and set `image` on each project.
 */
const shot = (url: string) => `https://image.thum.io/get/width/1200/crop/750/${url}`;

/** Put your screen recordings in /public/videos/projects/ — e.g. /public/videos/projects/inspire.mp4 */
const vid = (name: string) => `/projects/${name}.webm`;

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

// Module-level so the carousel gets a stable array (it reloads images when items change).
// The screenshot doubles as the video's poster, so a card is never blank while its video loads.
const CAROUSEL_ITEMS: CircularCarouselItem[] = PROJECTS.map((p) => ({
  src: p.image ?? shot(p.url),
  video: p.video,
  alt: `${p.title} website`,
  title: p.title,
  subtitle: p.type,
}));

const STATUS_STYLE: Record<ProjectStatus, string> = {
  Live: "bg-green-500/15 text-green-400",
  "In development": "bg-yellow-500/15 text-yellow-300",
  Freelance: "bg-[#e84020]/15 text-[#ff7a5c]",
};

/* ---------- responsive card size ---------- */

function useCardWidth() {
  const [width, setWidth] = useState(460);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setWidth(w < 640 ? 280 : w < 1024 ? 380 : 460);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
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
  const cardWidth = useCardWidth();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const handleChange = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  // First click on a side card brings it to the front; clicking the front card opens the site.
  const handleItemClick = useCallback((_: CircularCarouselItem, index: number) => {
    if (index === activeRef.current) {
      window.open(PROJECTS[index].url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const project = PROJECTS[active] ?? PROJECTS[0];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`w-full overflow-hidden bg-[#0a0a0a] py-20 md:py-28 ${className}`}
    >
      {/* header */}
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-6 px-6 md:mb-14 md:flex-row md:items-end md:justify-between md:px-12 lg:px-16">
        <div>
          <p className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:text-sm">
            {label}
          </p>
          <h2
            id={`${id}-heading`}
            className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl"
          >
            {heading}
            <span className="text-[#e84020]">.</span>
          </h2>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">
          Drag to explore · Click the front card to open
        </p>
      </div>

      {/* the loop — full width, panorama wall that wraps around endlessly */}
      <div className="relative h-[52vh] min-h-[340px] w-full md:h-[64vh] md:min-h-[480px]">
        <CircularCarousel
          items={CAROUSEL_ITEMS}
          preset="panorama"
          // flat cards (curve 0) → one <video> per card instead of 8 curved strips
          curve={0}
          intro="rise"
          cardWidth={cardWidth}
          aspectRatio={16 / 10}
          gap={28}
          tilt={0}
          autoplay="drift"
          speed={6}
          direction="left"
          draggable
          momentum={0.6}
          snap
          pauseOnHover
          focusOnClick
          parallax={0.25}
          stretch={0.4}
          depthFade={0.7}
          fadeColor="#0a0a0a"
          innerShade={0.6}
          cornerRadius={14}
          captions={false}
          onChange={handleChange}
          onItemClick={handleItemClick}
        />
      </div>

      {/* active project details */}
      <div className="mx-auto mt-10 max-w-7xl px-6 md:mt-14 md:px-12 lg:px-16">
        <div
          key={active}
          className="flex animate-[projectIn_500ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col gap-6 border-t border-white/10 pt-8 motion-reduce:animate-none md:flex-row md:items-start md:justify-between"
        >
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm tabular-nums text-white/40">
                {String(active + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[project.status]}`}>
                {project.status}
              </span>
              <span className="text-xs uppercase tracking-wider text-white/50">{project.type}</span>
            </div>
            <h3 className="text-2xl font-bold text-white md:text-4xl">{project.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-white/60 md:text-lg">{project.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech used">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="Visit"
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#e84020] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            Visit site
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>

      <style>{`@keyframes projectIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}