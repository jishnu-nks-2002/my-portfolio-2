"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TextLoop from "./TextLoop";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TimelineItem {
  label: string;
  title: string;
  detail: string;
}

interface AboutSectionProps {
  /** Section id for navbar / anchor links. */
  id?: string;
  label?: string;
  heading?: string;
  /** Words in the heading shown in orange italic serif. */
  headingAccents?: string[];
  imageSrc?: string;
  imageAlt?: string;
  /** Small floating card over the photo. Set badgeTitle to "" to hide it. */
  badgeLabel?: string;
  badgeTitle?: string;
  badgeDate?: string;
  badgeDesc?: string;
  /** Now / Before / Freelance rows under the paragraph. */
  timeline?: TimelineItem[];
  /** Text running along the crossed ribbons at the bottom. Set to "" to hide them. */
  loopText?: string;
  /** Body content. Defaults to a short CV-based paragraph. */
  children?: React.ReactNode;
  className?: string;
}

/* ---------- defaults (from CV) ---------- */

const DEFAULT_HEADING_ACCENTS = ["design", "code", "work."];

const DEFAULT_TIMELINE: TimelineItem[] = [
  { label: "Now", title: "Jr. Software Engineer", detail: "Mindstory · Thrissur" },
  { label: "Before", title: "MEARN Stack Intern", detail: "Neyndra Global Solutions" },
  { label: "Freelance", title: "Full-stack projects", detail: "Clients in UAE & Northern Europe" },
];

function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-black">{children}</span>;
}

const DEFAULT_CONTENT = (
  <p>
    I build full-stack web apps with <Strong>React, Next.js, Node.js and MongoDB</Strong>, and
    custom <Strong>Shopify</Strong> and <Strong>WordPress</Strong> sites. With a background in
    graphic design, I make sure what I ship looks as good as it works.
  </p>
);

/* ---------- scroll-reveal heading ---------- */

const normalize = (w: string) => w.toLowerCase().replace(/[^\w.]/g, "");

function RevealHeading({ id, text, accents }: { id: string; text: string; accents: string[] }) {
  const ref = useRef<HTMLHeadingElement>(null);

  const words = useMemo(() => {
    const accentSet = new Set(accents.flatMap((a) => a.split(/\s+/)).map(normalize));
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, accent: accentSet.has(normalize(word)) }));
  }, [text, accents]);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Plays once when the heading enters the view and then stays fully visible.
        // (The old version was tied to scroll position, so scrolling back up
        // faded the words out again and could leave them half-revealed.)
        gsap.fromTo(
          el.querySelectorAll(".reveal-word"),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [words] }
  );

  return (
    <h2
      ref={ref}
      id={id}
      className="text-4xl font-bold leading-[1.1] tracking-tight text-black md:text-5xl"
    >
      {words.map(({ word, accent }, i) => (
        <React.Fragment key={i}>
          <span
            className={`reveal-word inline-block ${
              accent ? "font-serif font-normal italic text-[#e84020]" : ""
            }`}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </h2>
  );
}

/* ---------- 3D tilt photo ----------
 * Tilts toward the mouse with a light glare. The orange frame sits behind the
 * photo and the education card floats in front, so they move at different depths.
 * Mouse-only; skipped on touch devices and for reduced motion.
 */

function TiltImage({
  src,
  alt,
  badge,
}: {
  src: string;
  alt: string;
  badge?: React.ReactNode;
}) {
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

    const MAX_DEG = 10;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let glareX = 50;
    let glareY = 50;
    let raf = 0;

    const loop = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      card.style.transform = `rotateX(${curY.toFixed(2)}deg) rotateY(${curX.toFixed(2)}deg)`;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 55%)`;
      if (Math.abs(targetX - curX) > 0.01 || Math.abs(targetY - curY) > 0.01) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      targetX = (nx - 0.5) * 2 * MAX_DEG;
      targetY = -(ny - 0.5) * 2 * MAX_DEG;
      glareX = nx * 100;
      glareY = ny * 100;
      glare.style.opacity = "1";
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
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
    <div ref={wrapRef} className="relative mr-5 mb-5 [perspective:1200px]">
      <div ref={cardRef} className="relative [transform-style:preserve-3d] will-change-transform">
        {/* back layer: orange frame peeking out bottom-right */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-xl border-2 border-[#e84020] [transform:translate3d(20px,20px,-40px)]"
        />

        {/* photo */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-200 shadow-2xl">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          />
        </div>

        {/* front layer: floating card */}
        {badge && (
          <div className="absolute bottom-4 left-4 right-4 [transform:translateZ(60px)] sm:right-auto md:bottom-6 md:-left-6">
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- section ---------- */

export default function AboutSection({
  id = "about",
  label = "// ABOUT",
  heading = "From design roots to full-stack code — I build web apps that look sharp and just work.",
  headingAccents = DEFAULT_HEADING_ACCENTS,
  imageSrc = "/images/about-img.jpeg",
  imageAlt = "Portrait of Jishnu Narayanan",
  badgeLabel = "Education",
  badgeTitle = "MEA(R)N Stack Web Development",
  badgeDate = "Luminar Technolab · 2023 – 2024",
  badgeDesc = "Diploma in Computer Engineering",
  timeline = DEFAULT_TIMELINE,
  loopText = "React ✦ Next.js ✦ Node.js ✦ MongoDB ✦ Shopify ✦ WordPress ✦ GSAP",
  children = DEFAULT_CONTENT,
  className = "",
}: AboutSectionProps) {
  const badge = badgeTitle ? (
    <div className="border-l-4 border-[#e84020] bg-white p-4 shadow-xl sm:max-w-[280px]">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#e84020]">
        {badgeLabel}
      </p>
      <h3 className="text-sm font-bold text-black">{badgeTitle}</h3>
      {badgeDate && <p className="mt-1 text-xs text-gray-600">{badgeDate}</p>}
      {badgeDesc && <p className="mt-1 text-xs text-gray-700">{badgeDesc}</p>}
    </div>
  ) : null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`w-full overflow-hidden bg-white px-6 py-16 md:px-12 md:py-24 lg:px-16 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:mb-12 md:text-sm">
          {label}
        </p>

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[5fr_7fr] lg:gap-20">
          {/* left: 3D photo */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <TiltImage src={imageSrc} alt={imageAlt} badge={badge} />
          </div>

          {/* right: heading + short body + timeline */}
          <div>
            <div className="mb-8">
              <RevealHeading id={`${id}-heading`} text={heading} accents={headingAccents} />
              <span aria-hidden="true" className="mt-7 block h-1 w-16 rounded-full bg-[#e84020]" />
            </div>

            <div className="max-w-xl space-y-5 text-base leading-relaxed text-gray-700 md:text-lg">
              {children}
            </div>

            {timeline.length > 0 && (
              <dl className="mt-10 max-w-xl divide-y divide-gray-200 border-y border-gray-200">
                {timeline.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[90px_1fr] items-baseline gap-4 py-4 md:grid-cols-[110px_1fr]"
                  >
                    <dt className="font-mono text-xs uppercase tracking-widest text-[#e84020]">
                      {item.label}
                    </dt>
                    <dd>
                      <span className="block font-semibold text-black">{item.title}</span>
                      <span className="text-sm text-gray-600">{item.detail}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      {/* crossed ribbons — negative margins cancel the section padding so they run edge to edge.
          The SVG is taller than the ribbons, so the wrapper crops the empty space above/below. */}
      {loopText && (
        <div className="-mx-6 mt-20 flex h-[100px] items-center overflow-hidden sm:h-[150px] md:-mx-12 md:mt-28 md:h-[200px] lg:-mx-16 lg:h-[300px]">
          <TextLoop
            text={loopText}
            separator="✦"
            shape="wave"
            curviness={18}
            tilt={-2}
            fontSize={40}
            fontWeight={800}
            letterSpacing={2}
            ribbon
            ribbonColor="#e84020"
            ribbonWidth={76}
            cross
            crossColor="#111111"
            crossAngle={8}
            speed={80}
            scrollBoost={1.2}
            draggable
            pauseOnHover
          />
        </div>
      )}
    </section>
  );
}