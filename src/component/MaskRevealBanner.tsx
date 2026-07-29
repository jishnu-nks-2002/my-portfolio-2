"use client";

import React, { useEffect, useState } from "react";
import { Mail, Phone, ArrowDown } from "lucide-react";
import RevealCanvas from "./RevealCanvas";
import CustomCursor from "./CustomCursor";
import SplitText from "./SplitText";

/**
 * MaskRevealBanner
 * ------------------------------------------------------------------
 * Hero banner: `frontImageSrc` is always visible; a trailing chain of
 * soft circles (tied to the cursor, with inertia and fade-out) reveals
 * `backImageSrc` as it drags across — same pair-of-photos idea as the
 * hero section on mohamedshehata.net. Pairs with a magnetic cursor
 * that grows and fills when it passes over a link or button.
 *
 * Files this depends on (same folder):
 *  - RevealCanvas.tsx   the canvas draw loop / trail math
 *  - CustomCursor.tsx   the dot + growing ring cursor
 *  - SplitText.tsx      per-character reveal animation (GSAP)
 * ------------------------------------------------------------------
 */

/** LinkedIn's mark isn't in lucide-react (brand icons were removed), so it's a small inline SVG. */
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
  mark?: string;
  sideLabel?: string;
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
  className?: string;
}

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

export default function MaskRevealBanner({
  frontImageSrc = PLACEHOLDER_FRONT,
  backImageSrc = PLACEHOLDER_BACK,
  mark = "W.",
  sideLabel = "Honors",
  email = "hello@example.com",
  phone = "+1 (000) 000-0000",
  linkedinUrl = "#",
  bottomTexts = ["Jishnu Narayanan", "Creative Developer"],
  bottomTextInterval = 3000,
  trailLength = 26,
  blobRadius = 130,
  className = "",
}: MaskRevealBannerProps) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (bottomTexts.length < 2) return;
    const id = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % bottomTexts.length);
    }, bottomTextInterval);
    return () => clearInterval(id);
  }, [bottomTexts, bottomTextInterval]);

  return (
    <section
      className={`relative w-full h-screen overflow-hidden cursor-none select-none bg-gradient-to-br from-[#3a0f08] via-[#8a2c10] to-[#e08a2e] ${className}`}
    >
      <CustomCursor size={8} ringSize={36} hoverRingSize={90} color="#f97316" mixBlendMode="normal" />

      {/* ambient glow blobs */}
      <div className="pointer-events-none absolute -top-24 right-0 h-[560px] w-[560px] rounded-full bg-orange-500/30 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-black/30 blur-[110px]" />

      {/* the reveal itself */}
      <div className="absolute inset-0">
        <RevealCanvas
          frontImageSrc={frontImageSrc}
          backImageSrc={backImageSrc}
          trailLength={trailLength}
          blobRadius={blobRadius}
        />
      </div>

      {/* top-right mark */}
      <div className="pointer-events-none absolute top-6 right-6 bg-black px-3 py-2 text-sm font-semibold tracking-wide text-white">
        {mark}
      </div>

      {/* right-edge vertical tab */}
      <div className="pointer-events-none absolute top-24 right-6 bg-black px-2 py-6 text-xs uppercase tracking-[0.25em] text-white [writing-mode:vertical-rl] rotate-180">
        {sideLabel}
      </div>

      {/* left-edge contact links — vertically centered, data-cursor-label drives the text inside the cursor ring */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-5 text-sm text-white/90">
        
        <a  href={linkedinUrl}
          data-cursor-label="Open"
          className="flex items-center gap-2 transition-colors hover:text-orange-400"
        >
          <LinkedinIcon size={16} /> LinkedIn
        </a>

        
        <a  href={`mailto:${email}`}
          data-cursor-label="Mail"
          className="flex items-center gap-2 transition-colors hover:text-orange-400"
        >
          <Mail size={16} /> Email
        </a>

        
        <a  href={`tel:${phone}`}
          data-cursor-label="Call"
          className="flex items-center gap-2 transition-colors hover:text-orange-400"
        >
          <Phone size={16} /> Phone
        </a>
      </div>

      {/* large bottom text — rotates through bottomTexts, replaying the split animation each switch */}
      <div className="absolute inset-x-0 bottom-16 z-10 px-8">
        <SplitText
          key={textIndex}
          text={bottomTexts[textIndex]}
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
          className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.9] tracking-tight text-white"
        />
      </div>

      {/* scroll cue */}
      <div
        data-cursor-label="Scroll"
        className="absolute bottom-6 right-8 z-10 animate-bounce text-white/70"
      >
        <ArrowDown size={20} />
      </div>
    </section>
  );
}