"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * Developer-style preloader.
 *
 * - A terminal "types" build commands one by one, each ticking ✓ when done.
 * - A big 000 → 100 counter + red progress bar, tied to the real page load
 *   (window load + fonts), with a minimum time so it never just flashes.
 * - Exit: the black screen lifts, then a red curtain follows, revealing the site.
 * - Repeat visits in the same tab get a short version; reduced motion gets a simple fade.
 * - Fires a `preloader:done` window event when finished (handy for starting hero animations).
 */

interface PreloaderProps {
  name?: string;
  /** Minimum time (ms) on first visit. */
  minDuration?: number;
  onDone?: () => void;
}

const RED = "#dc2626";
const SESSION_KEY = "jn-preloaded";

const LINES = [
  { cmd: "$ npm run portfolio", ok: false },
  { cmd: "> compiling components", ok: true },
  { cmd: "> connecting MongoDB · Express · React · Node", ok: true },
  { cmd: "> loading 13 projects", ok: true },
  { cmd: "> optimising animations", ok: true },
];

export default function Preloader({
  name = "Jishnu Narayanan",
  minDuration = 2600,
  onDone,
}: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden"; // no scrolling behind the loader

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {}
    const minMs = reduced ? 500 : seen ? 1000 : minDuration;

    const progress = { v: 0 };
    const render = () => {
      if (counterRef.current) counterRef.current.textContent = String(Math.round(progress.v)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.v / 100})`;
    };

    let cancelled = false;
    const ctx = gsap.context(() => {}, root);

    ctx.add(() => {
      const intro = gsap.timeline();

      // corners + terminal fade in
      intro.from(".pl-fade", { autoAlpha: 0, y: 12, duration: 0.5, ease: "power2.out", stagger: 0.06 });

      // terminal lines type out (steps ease = typewriter), then their ✓ pops
      const perLine = Math.max(0.12, (minMs / 1000 - 0.6) / LINES.length);
      gsap.utils.toArray<HTMLElement>(".pl-line").forEach((line, i) => {
        const text = line.querySelector<HTMLElement>(".pl-text");
        const check = line.querySelector<HTMLElement>(".pl-check");
        const chars = (text?.textContent ?? "").length || 10;
        intro.set(line, { autoAlpha: 1 }, 0.3 + i * perLine);
        if (text && !reduced) {
          intro.fromTo(
            text,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", duration: perLine * 0.7, ease: `steps(${chars})` },
            0.3 + i * perLine
          );
        }
        if (check) {
          intro.fromTo(
            check,
            { autoAlpha: 0, scale: 0.4 },
            { autoAlpha: 1, scale: 1, duration: 0.25, ease: "back.out(3)" },
            0.3 + i * perLine + perLine * 0.75
          );
        }
      });

      // counter runs to 90 during the minimum time; the last 10% waits for the real load
      gsap.to(progress, {
        v: 90,
        duration: minMs / 1000,
        ease: "power2.inOut",
        onUpdate: render,
      });
    });

    // real load: window load + fonts, capped so a slow asset can't trap the user
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const fontsReady = (document.fonts?.ready ?? Promise.resolve()).then(() => undefined);
    const cap = new Promise<void>((resolve) => setTimeout(resolve, 7000));
    const minTime = new Promise<void>((resolve) => setTimeout(resolve, minMs));

    Promise.all([minTime, Promise.race([Promise.all([pageLoaded, fontsReady]), cap])]).then(() => {
      if (cancelled) return;

      ctx.add(() => {
        const out = gsap.timeline({
          onComplete: () => {
            html.style.overflow = prevOverflow;
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {}
            window.dispatchEvent(new Event("preloader:done"));
            onDoneRef.current?.();
            setDone(true);
          },
        });

        out.to(progress, { v: 100, duration: 0.45, ease: "power2.out", onUpdate: render });
        out.to(".pl-ready", { autoAlpha: 1, duration: 0.2 }, "<0.15");

        if (reduced) {
          out.to(root, { autoAlpha: 0, duration: 0.4 }, "+=0.2");
          return;
        }

        // name slides up letter by letter
        out.fromTo(
          ".pl-name-char",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.6, ease: "power4.out", stagger: 0.025 },
          "+=0.05"
        );
        // content drifts out, black lifts, red curtain follows
        out.to(".pl-content", { y: -40, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.35");
        out.to(".pl-black", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.15");
        out.to(".pl-red", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.75");
      });
    });

    return () => {
      cancelled = true;
      ctx.revert();
      html.style.overflow = prevOverflow;
    };
  }, [minDuration]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[200] select-none"
    >
      {/* red curtain (lifts last) */}
      <div className="pl-red absolute inset-0" style={{ background: RED }} />

      {/* black screen */}
      <div className="pl-black absolute inset-0 overflow-hidden bg-[#0a0a0a] text-white">
        <div className="pl-content flex h-full flex-col justify-between p-6 md:p-10">
          {/* ---------- top row ---------- */}
          <div className="flex items-start justify-between">
            <span className="pl-fade text-lg font-bold tracking-tight md:text-xl">
              JU<span style={{ color: RED }}>.</span>
            </span>
            <span
              className="pl-fade font-mono text-xl font-bold motion-safe:animate-[spin_3s_linear_infinite] md:text-2xl"
              style={{ color: RED }}
              aria-hidden="true"
            >
              {"</>"}
            </span>
            <span className="pl-fade text-right font-mono text-[11px] uppercase tracking-widest text-white/50 md:text-xs">
              Portfolio
              <br />
              <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
            </span>
          </div>

          {/* ---------- terminal ---------- */}
          <div className="pl-fade mx-auto w-full max-w-xl rounded-2xl bg-white/[0.04] p-5 font-mono text-[13px] leading-relaxed md:p-6 md:text-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: RED }} />
              <span className="h-3 w-3 rounded-full bg-white/25" />
              <span className="h-3 w-3 rounded-full bg-white/25" />
              <span className="ml-3 text-xs text-white/40">~/jishnu — zsh</span>
            </div>

            <ul className="space-y-1.5">
              {LINES.map((line, i) => (
                <li key={i} className="pl-line invisible flex items-center justify-between gap-4">
                  <span className={`pl-text truncate ${i === 0 ? "text-white" : "text-white/70"}`}>
                    {line.cmd}
                  </span>
                  {line.ok && (
                    <span className="pl-check invisible shrink-0" style={{ color: RED }}>
                      ✓
                    </span>
                  )}
                </li>
              ))}
              <li className="pl-ready invisible text-white">
                <span style={{ color: RED }}>✓</span> ready — welcome
                <span
                  className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] motion-safe:animate-pulse"
                  style={{ background: RED }}
                  aria-hidden="true"
                />
              </li>
            </ul>
          </div>

          {/* ---------- bottom row ---------- */}
          <div className="flex items-end justify-between gap-6">
            <div className="pl-fade">
              {/* name reveal (each letter slides up at the end) */}
              <p className="mb-2 overflow-hidden text-sm font-semibold uppercase tracking-[0.25em] text-white/80 md:text-base">
                {name.split("").map((ch, i) => (
                  <span key={i} className="pl-name-char inline-block translate-y-[110%]">
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </p>
              <span
                ref={counterRef}
                className="block font-mono text-[clamp(4.5rem,16vw,13rem)] font-bold leading-[0.85] tabular-nums tracking-tighter"
              >
                000
              </span>
            </div>

            <div className="pl-fade mb-3 w-32 shrink-0 md:w-72">
              <p className="mb-3 text-right font-mono text-[10px] uppercase tracking-widest text-white/50 md:text-xs">
                Building experience
              </p>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  ref={barRef}
                  className="h-full w-full origin-left rounded-full"
                  style={{ background: RED, transform: "scaleX(0)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}