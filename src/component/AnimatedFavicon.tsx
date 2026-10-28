"use client";

import { useEffect } from "react";

/**
 * Animated "JU." favicon.
 *
 * Browsers like Chrome only show the first frame of an animated SVG favicon, so this
 * redraws the icon on a tiny canvas ~12 times a second and swaps it into the tab.
 * - Colours swap smoothly: white letters + red dot  ⇄  red letters + white dot.
 * - When you switch away, the tab title changes to a "come back" message.
 * - Static icon (app/icon.svg) is used as the fallback, and for reduced motion.
 */

interface AnimatedFaviconProps {
  /** Tab title shown while the visitor is on another tab. "" to turn off. */
  awayTitle?: string;
  /** Frames per second for the tab icon. */
  fps?: number;
}

const SIZE = 64; // favicon canvas size (drawn from the 512×512 artwork)
const BG = "#0a0a0a";
const WHITE: [number, number, number] = [255, 255, 255];
const RED: [number, number, number] = [220, 38, 38]; // #dc2626
/** Seconds for one full white → red → white cycle. */
const CYCLE_MS = 2400;

const mix = (a: [number, number, number], b: [number, number, number], t: number) =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

// "JU" letter shapes from the favicon SVG (512×512 artboard).
// Kept as a plain string here — Path2D only exists in the browser, so it's created
// inside useEffect (creating it at the top level crashes the server build).
const LETTERS_PATH =
  "M112.2 365.2C162.8 365.2 190.9 340.1 190.9 295.1V146.8H130.9V293.9C130.9 307.8 123.8 315.6 111.1 315.6C98.5 315.6 91.4 307.8 91.4 293.9V276.3H36V293.4C36 339.5 63.3 365.2 112.2 365.2Z M306.6 365.2C362.7 365.2 399.2 333.7 399.2 285.3V146.8H340.9V280.4C340.9 300.4 326.8 314.7 306.6 314.7C286.7 314.7 272.3 300.3 272.3 280.4V146.8H214V285.3C214 333.9 250.3 365.2 306.6 365.2Z";
const DOT = { x: 445, y: 334.2, r: 31 };

export default function AnimatedFavicon({
  awayTitle = "Jishnu Narayanan | MERN Stack Developer",
  fps = 12,
}: AnimatedFaviconProps) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- "come back" tab title ---------- */
    let originalTitle = document.title;
    const onVisibility = () => {
      if (!awayTitle) return;
      if (document.hidden) {
        originalTitle = document.title;
        document.title = awayTitle;
      } else {
        document.title = originalTitle;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // browser-only canvas features — skip the animation (keep the static icon) if missing
    if (reduced || typeof Path2D === "undefined") {
      return () => document.removeEventListener("visibilitychange", onVisibility);
    }
    const LETTERS = new Path2D(LETTERS_PATH);

    /* ---------- animated icon ---------- */
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => document.removeEventListener("visibilitychange", onVisibility);

    // our own <link rel="icon">, added last so browsers use it over the static ones
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    const k = SIZE / 512;

    const draw = (t: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.setTransform(k, 0, 0, k, 0, 0);

      // rounded black tile
      ctx.fillStyle = BG;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, 512, 512, 104);
      else ctx.rect(0, 0, 512, 512); // very old browsers: square tile
      ctx.fill();

      // 0 → 1 → 0 over the cycle, eased, with a short hold at each end
      const p = (t % CYCLE_MS) / CYCLE_MS;
      const wave = 0.5 - 0.5 * Math.cos(p * Math.PI * 2); // 0 … 1 … 0
      const swap = Math.min(1, Math.max(0, (wave - 0.15) / 0.7)); // hold white/red briefly
      const eased = swap * swap * (3 - 2 * swap);

      // letters: white → red,  dot: red → white (always opposite)
      ctx.fillStyle = mix(WHITE, RED, eased);
      ctx.fill(LETTERS);

      ctx.fillStyle = mix(RED, WHITE, eased);
      ctx.beginPath();
      ctx.arc(DOT.x, DOT.y, DOT.r, 0, Math.PI * 2);
      ctx.fill();

      link.href = canvas.toDataURL("image/png");
    };

    draw(0);
    const start = performance.now();
    // setInterval keeps ticking (slowly) in background tabs, where the favicon is still visible
    const timer = window.setInterval(() => draw(performance.now() - start), 1000 / fps);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      link.remove();
    };
  }, [awayTitle, fps]);

  return null;
}