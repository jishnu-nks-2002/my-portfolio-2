"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitText from "./SplitText";

gsap.registerPlugin(ScrollTrigger);

export interface GalleryProject {
  eyebrow?: string;
  title: string;
  description?: string;
  tags?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  videoSrc: string;
  poster?: string;
  accentColor?: string;
}

export interface ProjectShowcaseGalleryProps {
  projects: GalleryProject[];
  /** Optional single-letter/word mark shown fixed on the right edge (e.g. "W.") */
  logoMark?: string;
  /** Optional vertical rotated label shown under the logo mark (e.g. "Honors") */
  sideLabel?: string;
  className?: string;
}

const NUM_STRIPS = 14;

export default function ProjectShowcaseGallery({
  projects,
  logoMark,
  sideLabel,
  className = "",
}: ProjectShowcaseGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const n = projects.length;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || n === 0) return;

      const strips = gsap.utils.toArray<HTMLElement>(".reveal-strip", section);
      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];

      const setStripColor = (color: string) => {
        gsap.set(strips, {
          background: `linear-gradient(90deg, ${color}, rgba(10,10,10,0.85) 140%)`,
        });
      };

      // Initial state: strips fully covering, only the first layer visible
      gsap.set(strips, { scaleX: 1 });
      gsap.set(layers, { autoAlpha: 0 });
      if (layers[0]) gsap.set(layers[0], { autoAlpha: 1 });
      setStripColor(projects[0]?.accentColor || "#e84020");

      videoRefs.current.forEach((v, i) => {
        if (!v) return;
        if (i === 0) v.play().catch(() => {});
        else v.pause();
      });

      const updateCounter = (i: number) => {
        if (!counterRef.current) return;
        counterRef.current.textContent = `${String(i + 1).padStart(
          2,
          "0"
        )} / ${String(n).padStart(2, "0")}`;
      };
      updateCounter(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${n * 100}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // Reveal the first project
      tl.to(strips, {
        scaleX: 0,
        transformOrigin: (i: number) => (i % 2 === 0 ? "right" : "left"),
        stagger: 0.045,
        ease: "power2.inOut",
        duration: 1,
      });

      // Cover -> swap -> uncover for each subsequent project
      for (let i = 1; i < n; i++) {
        const prevIdx = i - 1;

        tl.to(strips, {
          scaleX: 1,
          transformOrigin: (idx: number) => (idx % 2 === 0 ? "left" : "right"),
          stagger: 0.03,
          ease: "power2.inOut",
          duration: 1,
        })
          .call(() => {
            videoRefs.current[prevIdx]?.pause();
            videoRefs.current[i]?.play().catch(() => {});
            updateCounter(i);
            setStripColor(projects[i]?.accentColor || "#e84020");
          })
          .set(layers[prevIdx], { autoAlpha: 0 })
          .set(layers[i], { autoAlpha: 1 })
          .to(strips, {
            scaleX: 0,
            transformOrigin: (idx: number) => (idx % 2 === 0 ? "right" : "left"),
            stagger: 0.045,
            ease: "power2.inOut",
            duration: 1,
          });
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [n] }
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!dotRef.current || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    gsap.to(dotRef.current, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.5,
      ease: "power3.out",
      overwrite: true,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className={`relative h-screen w-full overflow-hidden bg-black ${className}`}
    >
      {/* Project layers, stacked on top of each other */}
      {projects.map((project, i) => (
        <div
          key={project.title}
          ref={(el) => {
            layerRefs.current[i] = el;
          }}
          className="absolute inset-0 z-0"
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="h-full w-full object-cover"
            src={project.videoSrc}
            poster={project.poster}
            autoPlay={i === 0}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

          {/* Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-16 md:px-16 md:pb-24">
            <div className="max-w-xl">
              {project.eyebrow && (
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/60">
                  {project.eyebrow}
                </p>
              )}

              <h2 className="mb-4">
                <SplitText
                  text={project.title}
                  tag="span"
                  splitType="words, chars"
                  className="block font-extrabold uppercase leading-[0.95] text-white"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  duration={0.9}
                  delay={20}
                  animateOnScroll={false}
                  startDelay={i === 0 ? 200 : 0}
                  textAlign="left"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)" as any,
                  }}
                />
              </h2>

              {project.description && (
                <p className="mb-6 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
                  {project.description}
                </p>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/20 px-3 py-1 font-mono text-[11px] tracking-wide text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={project.ctaHref || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black transition-transform duration-300 hover:scale-105"
                style={{ backgroundColor: project.accentColor || "#e84020" }}
              >
                {project.ctaLabel || "VIEW LIVE"}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Blinds / strip transition overlay — sits above every layer */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
        {Array.from({ length: NUM_STRIPS }).map((_, i) => (
          <div
            key={i}
            className="reveal-strip flex-1"
            style={{ mixBlendMode: "multiply" }}
          />
        ))}
      </div>

      {/* Mouse-follow accent dot */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute left-0 top-0 z-30 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 md:block"
      />

      {/* Top meta row */}
      <div
        ref={counterRef}
        className="absolute top-6 right-6 z-30 font-mono text-xs tracking-widest text-white/60"
      >
        01 / {String(n).padStart(2, "0")}
      </div>

      {/* Optional side branding */}
      {(logoMark || sideLabel) && (
        <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
          {logoMark && (
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-sm font-semibold text-white">
              {logoMark}
            </div>
          )}
          {sideLabel && (
            <span
              className="font-mono text-[11px] tracking-widest text-white/40"
              style={{ writingMode: "vertical-rl" }}
            >
              {sideLabel}
            </span>
          )}
        </div>
      )}

      {/* Scroll cue */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/50">
        SCROLL
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-bounce"
        >
          <path d="M12 5v14" />
          <path d="m5 12 7 7 7-7" />
        </svg>
      </div>

      {/* Overall progress bar across all projects */}
      <div className="absolute bottom-0 left-0 z-30 h-[2px] w-full bg-white/10">
        <div
          ref={progressRef}
          className="h-full w-full origin-left bg-white"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </section>
  );
}