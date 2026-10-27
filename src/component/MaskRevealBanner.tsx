"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mail, Phone, ArrowDown, MapPin } from "lucide-react";
import RevealCanvas from "./RevealCanvas";
import CustomCursor from "./CustomCursor";
import SplitText from "./SplitText";

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

interface MaskRevealBannerProps {
  /** Always-visible base photo. */
  frontImageSrc?: string;
  /** Photo revealed by the cursor trail. */
  backImageSrc?: string;
  /** Monogram shown top-left. */
  mark?: string;
  /** Label shown on the right (current role / company). */
  sideLabel?: string;
  /** Location shown under the side label. */
  location?: string;
  /** Short intro line shown above the big rotating text. */
  tagline?: string;
  /** Skill chips shown on the right. */
  skills?: string[];
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  /** Large bottom texts that rotate one after another over time. */
  bottomTexts?: string[];
  /** How long (ms) each bottom text stays visible before switching to the next. */
  bottomTextInterval?: number;
  /** Number of circles making up the reveal trail. */
  trailLength?: number;
  /** Radius (px) of each reveal circle. */
  blobRadius?: number;
  /** id of the section the scroll arrow should scroll to. If omitted, scrolls one screen down. */
  nextSectionId?: string;
  className?: string;
}

/* ---------- module-level defaults (stable references → no effect re-runs) ---------- */

const PLACEHOLDER_FRONT =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
      <rect width="900" height="1100" fill="#3a2a22"/>
      <circle cx="450" cy="430" r="230" fill="#4a3a30"/>
      <path d="M180 1100 C180 760 320 640 450 640 C580 640 720 760 720 1100 Z" fill="#4a3a30"/>
    </svg>
  `);

const PLACEHOLDER_BACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100">
      <rect width="900" height="1100" fill="#1f1f1f"/>
      <circle cx="450" cy="430" r="230" fill="#5a5a5a"/>
      <path d="M180 1100 C180 760 320 640 450 640 C580 640 720 760 720 1100 Z" fill="#5a5a5a"/>
    </svg>
  `);

const DEFAULT_SKILLS = ["React", "Next.js", "Node.js", "MongoDB", "GSAP", "Shopify", "WordPress"];

const DEFAULT_BOTTOM_TEXTS = [
  "Jishnu Narayanan",
  "Jr. Software Engineer",
  "MERN Stack Developer",
  "Shopify & WordPress",
];

/* ---------- small hooks ---------- */

/** true only on devices with a real mouse (hides the custom cursor on phones/tablets). */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* ---------- component ---------- */

export default function MaskRevealBanner({
  frontImageSrc = PLACEHOLDER_FRONT,
  backImageSrc = PLACEHOLDER_BACK,
  mark = "",
  sideLabel = "Jr. Software Engineer @ Mindstory",
  location = "Thrissur, Kerala",
  tagline = "MERN Stack Developer building dynamic, scalable & user-friendly web experiences.",
  skills = DEFAULT_SKILLS,
  email = "jishnunarayanan2002@gmail.com",
  phone = "+91 7012521841",
  linkedinUrl = "https://www.linkedin.com/in/jishnu-narayanan-ks",
  bottomTexts = DEFAULT_BOTTOM_TEXTS,
  bottomTextInterval = 3000,
  trailLength = 26,
  blobRadius = 130,
  nextSectionId,
  className = "",
}: MaskRevealBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();

  const [textIndex, setTextIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Keep the index valid even if the parent passes a shorter array later.
  const textCount = bottomTexts.length;
  const safeIndex = textCount > 0 ? textIndex % textCount : 0;
  const currentText = textCount > 0 ? bottomTexts[safeIndex] : "";

  // Pause the rotation when the banner is scrolled out of view…
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // …or when the browser tab is in the background.
  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Rotate bottom text. Depends on the count (a number), not the array identity,
  // so inline arrays from the parent don't restart the timer on every render.
  useEffect(() => {
    if (textCount < 2 || !inView || !tabVisible) return;
    const id = window.setInterval(() => {
      setTextIndex((prev) => (prev + 1) % textCount);
    }, Math.max(bottomTextInterval, 1200));
    return () => window.clearInterval(id);
  }, [textCount, bottomTextInterval, inView, tabVisible]);

  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  const handleScrollDown = () => {
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";
    const target = nextSectionId ? document.getElementById(nextSectionId) : null;
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
    } else {
      const bottom = sectionRef.current?.getBoundingClientRect().bottom ?? window.innerHeight;
      window.scrollBy({ top: bottom, behavior });
    }
  };

  const handleMarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className={`relative isolate w-full h-screen supports-[height:100svh]:h-[100svh] min-h-[560px] overflow-hidden select-none bg-gradient-to-br from-[#3a0f08] via-[#8a2c10] to-[#e08a2e] ${
        finePointer ? "cursor-none" : ""
      } ${className}`}
    >
      {/* custom cursor only where there's a real mouse */}
      {finePointer && (
        <CustomCursor
          size={8}
          ringSize={36}
          hoverRingSize={90}
          color="#f97316"
          mixBlendMode="normal"
          scopeRef={sectionRef}
        />
      )}

      {/* ambient glow blobs — GPU-promoted so the blur doesn't repaint every frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-[560px] w-[560px] rounded-full bg-orange-500/30 blur-[120px] transform-gpu"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-black/30 blur-[110px] transform-gpu"
      />

      {/* the reveal itself */}
      <div className="absolute inset-0 z-0">
        <RevealCanvas
          frontImageSrc={frontImageSrc}
          backImageSrc={backImageSrc}
          trailLength={trailLength}
          blobRadius={blobRadius}
        />
      </div>

      {/* monogram — top left */}
      <a
        href="#"
        onClick={handleMarkClick}
        data-cursor-label="Home"
        aria-label="Back to top"
        className="absolute left-5 top-6 z-10 text-2xl font-bold tracking-tight text-white md:left-8 md:top-8 md:text-3xl"
      >
        {mark}
      </a>

      {/* role + location + skills — right edge, vertically centered (desktop) */}
      <div className="pointer-events-none absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 md:block">
        <div className="pointer-events-auto flex flex-col items-end gap-1 text-right">
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {!reducedMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {sideLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70">
            <MapPin size={12} aria-hidden="true" /> {location}
          </span>

          {skills.length > 0 && (
            <ul className="mt-3 flex max-w-xs flex-wrap justify-end gap-2">
              {skills.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/80 backdrop-blur-sm"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* role + location — compact top-right version for mobile */}
      <div className="absolute right-5 top-7 z-10 flex flex-col items-end gap-0.5 text-right md:hidden">
        <span className="flex items-center gap-1.5 text-xs font-medium text-white">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden="true" />
          {sideLabel}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-white/70">
          <MapPin size={10} aria-hidden="true" /> {location}
        </span>
      </div>

      {/* left-edge contact links — vertically centered */}
      <nav
        aria-label="Contact"
        className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-5 text-sm text-white/90 md:left-8"
      >
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-label="Open"
          className="flex items-center gap-2 transition-colors hover:text-orange-400 focus-visible:text-orange-400 focus-visible:outline-none"
        >
          <LinkedinIcon size={16} /> LinkedIn
        </a>

        <a
          href={`mailto:${email}`}
          data-cursor-label="Mail"
          className="flex items-center gap-2 transition-colors hover:text-orange-400 focus-visible:text-orange-400 focus-visible:outline-none"
        >
          <Mail size={16} aria-hidden="true" /> Email
        </a>

        <a
          href={telHref}
          data-cursor-label="Call"
          className="flex items-center gap-2 transition-colors hover:text-orange-400 focus-visible:text-orange-400 focus-visible:outline-none"
        >
          <Phone size={16} aria-hidden="true" /> Phone
        </a>
      </nav>

      {/* tagline + large rotating text */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 px-5 md:bottom-16 md:px-8">
        <p className="mb-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base">{tagline}</p>

        {/* min height so the layout doesn't jump between texts; text may wrap on phones */}
        <div className="min-h-[clamp(2.25rem,8vw,7rem)]" aria-live="polite">
          {currentText &&
            (reducedMotion ? (
              <h2 className="pb-[0.12em] text-[clamp(2.25rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight text-white">
                {currentText}
              </h2>
            ) : (
              <SplitText
                key={`${safeIndex}-${currentText}`}
                text={currentText}
                tag="h2"
                splitType="chars"
                delay={30}
                duration={1}
                ease="power3.out"
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                animateOnScroll={false}
                startDelay={0}
                textAlign="left"
                className="max-w-full pb-[0.12em] text-[clamp(2.25rem,8vw,7rem)] font-bold leading-[0.95] tracking-tight text-white"
              />
            ))}
        </div>
      </div>

      {/* scroll cue */}
      <button
        type="button"
        onClick={handleScrollDown}
        data-cursor-label="Scroll"
        aria-label="Scroll to next section"
        className={`absolute bottom-6 right-5 z-10 text-white/70 transition-colors hover:text-white md:right-8 ${
          reducedMotion ? "" : "animate-bounce"
        } ${finePointer ? "cursor-none" : ""}`}
      >
        <ArrowDown size={20} />
      </button>
    </section>
  );
}