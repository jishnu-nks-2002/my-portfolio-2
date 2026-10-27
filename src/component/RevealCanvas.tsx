"use client";

import { useRef, useEffect } from "react";

interface RevealCanvasProps {
  /** Always-visible base image. */
  frontImageSrc: string;
  /** Image revealed by the cursor trail. */
  backImageSrc: string;
  /** How many trailing circles make up the reveal tail. */
  trailLength?: number;
  /** Radius (px) of each reveal circle. */
  blobRadius?: number;
  /** How much the trail keeps drifting after the pointer stops (0-1, closer to 1 = more glide). */
  inertia?: number;
  /** How quickly the head circle catches up to the pointer (0-1, higher = snappier). */
  smoothing?: number;
  fadeDelayMs?: number;
  fadeDurationMs?: number;
  /** How long (ms) with no pointer movement before the reveal is treated as idle and fades out. */
  idleTimeoutMs?: number;
  className?: string;
}

interface TrailPoint {
  x: number;
  y: number;
}

/** Simulation runs at a fixed 60 steps/sec so the trail looks identical on 60Hz, 120Hz and 144Hz screens. */
const STEP_MS = 1000 / 60;
const OFFSCREEN = -9999;

export default function RevealCanvas({
  frontImageSrc,
  backImageSrc,
  trailLength = 26,
  blobRadius = 130,
  inertia = 0.87,
  smoothing = 0.2,
  fadeDelayMs = 200,
  fadeDurationMs = 900,
  idleTimeoutMs = 120,
  className,
}: RevealCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let dpr = 1;
    let w = 0; // CSS px
    let h = 0;
    let pw = 0; // device px
    let ph = 0;

    /* ---------- offscreen layers ----------
     * frontLayer / backLayer: each image pre-scaled ONCE to the canvas size (object-cover).
     * maskLayer: the trail circles, then the back image composited into them.
     * This replaces 26 clipped full-image draws per frame with 3 cheap blits.
     */
    const frontLayer = document.createElement("canvas");
    const backLayer = document.createElement("canvas");
    const maskLayer = document.createElement("canvas");
    const fctx = frontLayer.getContext("2d");
    const bctx = backLayer.getContext("2d");
    const mctx = maskLayer.getContext("2d");
    if (!fctx || !bctx || !mctx) return;

    const frontImg = new Image();
    const backImg = new Image();
    frontImg.decoding = "async";
    backImg.decoding = "async";
    let frontReady = false;
    let backReady = false;

    // object-cover fit, biased slightly toward the top (like object-top)
    const paintCover = (
      layer: HTMLCanvasElement,
      lctx: CanvasRenderingContext2D,
      img: HTMLImageElement
    ) => {
      layer.width = pw;
      layer.height = ph;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih || !pw || !ph) return;
      const ir = iw / ih;
      const cr = pw / ph;
      let dw = pw;
      let dh = ph;
      let dx = 0;
      let dy = 0;
      if (ir > cr) {
        dh = ph;
        dw = ph * ir;
        dx = (pw - dw) / 2;
      } else {
        dw = pw;
        dh = pw / ir;
        dy = (ph - dh) * 0.15;
      }
      lctx.imageSmoothingQuality = "high";
      lctx.drawImage(img, dx, dy, dw, dh);
    };

    const rebuild = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = container.clientWidth;
      h = container.clientHeight;
      pw = Math.max(1, Math.round(w * dpr));
      ph = Math.max(1, Math.round(h * dpr));
      canvas.width = pw;
      canvas.height = ph;
      maskLayer.width = pw;
      maskLayer.height = ph;
      if (frontReady) paintCover(frontLayer, fctx, frontImg);
      if (backReady) paintCover(backLayer, bctx, backImg);
    };

    /* ---------- trail state ---------- */
    const trail: TrailPoint[] = Array.from({ length: Math.max(1, trailLength) }, () => ({
      x: OFFSCREEN,
      y: OFFSCREEN,
    }));
    let headX = OFFSCREEN;
    let headY = OFFSCREEN;
    let targetX = OFFSCREEN;
    let targetY = OFFSCREEN;
    let velX = 0;
    let velY = 0;
    let pointerInside = false;
    let pointerActive = false;
    let lastMoveTime = performance.now();
    let opacity = 0;

    const snapTo = (x: number, y: number) => {
      headX = targetX = x;
      headY = targetY = y;
      velX = velY = 0;
      for (const p of trail) {
        p.x = x;
        p.y = y;
      }
    };

    const simulate = (now: number) => {
      // No movement for a moment → treat as idle, even if still inside.
      if (pointerActive && now - lastMoveTime > idleTimeoutMs) pointerActive = false;

      if (pointerActive) {
        velX = (targetX - headX) * (1 - smoothing);
        velY = (targetY - headY) * (1 - smoothing);
        headX += (targetX - headX) * smoothing;
        headY += (targetY - headY) * smoothing;
        opacity = Math.min(1, opacity + 0.08);
      } else {
        velX *= inertia;
        velY *= inertia;
        headX += velX;
        headY += velY;
        const dt = now - lastMoveTime;
        if (dt > fadeDelayMs) {
          const k = Math.min(1, (dt - fadeDelayMs) / fadeDurationMs);
          opacity = Math.min(opacity, Math.max(0, 1 - k));
        }
      }

      for (let i = trail.length - 1; i > 0; i--) {
        trail[i].x = trail[i - 1].x;
        trail[i].y = trail[i - 1].y;
      }
      trail[0].x = headX;
      trail[0].y = headY;
    };

    const render = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pw, ph);
      if (!frontReady) return;

      ctx.drawImage(frontLayer, 0, 0);
      if (!backReady || opacity <= 0.001) return;

      // 1) paint trail circles into the mask
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.globalCompositeOperation = "source-over";
      mctx.globalAlpha = 1;
      mctx.clearRect(0, 0, pw, ph);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.fillStyle = "#000";
      const len = trail.length;
      for (let i = len - 1; i >= 0; i--) {
        const t = 1 - i / len;
        const a = Math.pow(t, 1.6) * opacity;
        if (a <= 0.01) continue;
        const r = blobRadius * (0.55 + 0.45 * t);
        mctx.globalAlpha = a;
        mctx.beginPath();
        mctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
        mctx.fill();
      }

      // 2) keep the back image only where the mask is painted
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.globalAlpha = 1;
      mctx.globalCompositeOperation = "source-in";
      mctx.drawImage(backLayer, 0, 0);
      mctx.globalCompositeOperation = "source-over";

      // 3) composite onto the visible canvas
      ctx.drawImage(maskLayer, 0, 0);
    };

    /* ---------- loop (only runs while something is moving) ---------- */
    let raf = 0;
    let running = false;
    let lastFrame = 0;
    let acc = 0;

    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;

      if (!lastFrame) lastFrame = now;
      acc += Math.min(now - lastFrame, 100); // clamp so a background tab doesn't cause a huge catch-up
      lastFrame = now;
      while (acc >= STEP_MS) {
        simulate(now);
        acc -= STEP_MS;
      }

      render();

      if (pointerActive || opacity > 0.001) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
        lastFrame = 0;
        acc = 0;
      }
    };

    const wake = () => {
      if (running || disposed) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    /* ---------- images ---------- */
    frontImg.onload = () => {
      if (disposed) return;
      frontReady = true;
      paintCover(frontLayer, fctx, frontImg);
      wake();
    };
    backImg.onload = () => {
      if (disposed) return;
      backReady = true;
      paintCover(backLayer, bctx, backImg);
      wake();
    };
    frontImg.src = frontImageSrc;
    backImg.src = backImageSrc;

    /* ---------- pointer ----------
     * Listen on window, not the container, so the reveal keeps working while the
     * pointer is over the banner's text and links (which sit on top of the canvas).
     */
    const leave = () => {
      if (!pointerInside && !pointerActive) return;
      pointerInside = false;
      pointerActive = false;
      lastMoveTime = performance.now();
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

      if (!inside) {
        leave();
        return;
      }

      // Fresh entry after the trail has fully faded → start at the pointer
      // instead of streaking in from wherever it last was.
      if (headX === OFFSCREEN || opacity <= 0.001) snapTo(x, y);

      targetX = x;
      targetY = y;
      pointerInside = true;
      pointerActive = true;
      lastMoveTime = performance.now();
      wake();
    };

    const ro = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    ro.observe(container);
    rebuild();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      frontImg.onload = null;
      backImg.onload = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [
    frontImageSrc,
    backImageSrc,
    trailLength,
    blobRadius,
    inertia,
    smoothing,
    fadeDelayMs,
    fadeDurationMs,
    idleTimeoutMs,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}