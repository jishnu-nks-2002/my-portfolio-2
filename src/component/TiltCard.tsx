"use client";

import React, { useEffect, useRef } from "react";

/**
 * Borderless 3D tilt card, shared by the Expertise and Work Experience sections.
 *
 * - Tilts toward the mouse with a soft glare; children can sit at different depths
 *   with `[transform:translateZ(..px)]` so they shift against each other.
 * - The animation loop only runs while the card is moving, and will-change is only
 *   applied during hover so idle cards don't hold extra GPU memory.
 * - Flat on touch screens and with reduced motion.
 */

interface TiltCardProps {
  /** Classes on the outer wrapper (grid placement, animation hooks). */
  className?: string;
  /** Extra classes on the card surface (padding etc.). */
  cardClassName?: string;
  /** Maximum tilt in degrees. */
  maxTilt?: number;
  children: React.ReactNode;
}

export default function TiltCard({
  className = "",
  cardClassName = "",
  maxTilt = 7,
  children,
}: TiltCardProps) {
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

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let rect: DOMRect | null = null;

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      const done = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01;
      if (done) {
        cx = tx;
        cy = ty;
      }
      card.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      if (done) {
        raf = 0;
        if (tx === 0 && ty === 0) {
          card.style.transform = "";
          card.style.willChange = "";
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onEnter = () => {
      rect = wrap.getBoundingClientRect(); // measure once per hover, not every move
      card.style.willChange = "transform";
      glare.style.opacity = "1";
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!rect) rect = wrap.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      tx = (nx - 0.5) * 2 * maxTilt;
      ty = -(ny - 0.5) * 2 * maxTilt;
      glare.style.setProperty("--gx", `${(nx * 100).toFixed(1)}%`);
      glare.style.setProperty("--gy", `${(ny * 100).toFixed(1)}%`);
      start();
    };
    const onLeave = () => {
      rect = null;
      tx = 0;
      ty = 0;
      glare.style.opacity = "0";
      start();
    };
    // page scrolled while hovering → cached rect is stale
    const onScroll = () => {
      rect = null;
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [maxTilt]);

  return (
    // outer wrapper: perspective + entrance animations (kept separate from the tilt transform)
    <div ref={wrapRef} className={`group [perspective:1200px] ${className}`}>
      <div
        ref={cardRef}
        className={`relative h-full rounded-3xl bg-white/90 [transform-style:preserve-3d]
          shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]
          transition-shadow duration-500
          group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_40px_70px_-24px_rgba(232,64,32,0.35),0_24px_40px_-24px_rgba(0,0,0,0.25)]
          ${cardClassName}`}
      >
        {/* glare — plain alpha (no blend mode, which forces repaints over animated backgrounds) */}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 [transform:translateZ(1px)]"
          style={{
            background:
              "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.55), rgba(255,255,255,0) 50%)",
          }}
        />
        {children}
      </div>
    </div>
  );
}