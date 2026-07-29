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
  /** How long (ms) with no pointer movement before the reveal starts treating the cursor as "idle" and fading out, even if it's still inside the container. */
  idleTimeoutMs?: number;
  className?: string;
}

interface TrailPoint {
  x: number;
  y: number;
}

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const frontImg = new Image();
    const backImg = new Image();
    let frontLoaded = false;
    let backLoaded = false;
    frontImg.src = frontImageSrc;
    backImg.src = backImageSrc;
    frontImg.onload = () => {
      frontLoaded = true;
      wake();
    };
    backImg.onload = () => {
      backLoaded = true;
      wake();
    };

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;

    const rebuild = () => {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const trail: TrailPoint[] = Array.from({ length: trailLength }, () => ({
      x: -9999,
      y: -9999,
    }));
    let headX = -9999;
    let headY = -9999;
    let targetX = -9999;
    let targetY = -9999;
    let velX = 0;
    let velY = 0;
    let pointerActive = false;
    let lastMoveTime = performance.now();
    let opacity = 0;

    // object-cover style fit, biased slightly toward the top (like object-top)
    const coverRect = (image: HTMLImageElement) => {
      const ir = image.width / image.height;
      const cr = w / h;
      let dw = w;
      let dh = h;
      let dx = 0;
      let dy = 0;
      if (ir > cr) {
        dh = h;
        dw = h * ir;
        dx = (w - dw) / 2;
      } else {
        dw = w;
        dh = w / ir;
        dy = (h - dh) * 0.15;
      }
      return { dw, dh, dx, dy };
    };

    const draw = (now: number) => {
      // If the pointer hasn't actually moved in a while, treat it as idle even
      // though it may still be inside the container — this is what makes the
      // reveal only show up while the cursor is actively dragging across.
      if (pointerActive && now - lastMoveTime > idleTimeoutMs) {
        pointerActive = false;
      }

      ctx.clearRect(0, 0, w, h);

      if (!frontLoaded) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const front = coverRect(frontImg);
      ctx.drawImage(frontImg, front.dx, front.dy, front.dw, front.dh);

      if (!backLoaded) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const back = coverRect(backImg);

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
          opacity = Math.max(0, 1 - k);
        }
      }

      for (let i = trail.length - 1; i > 0; i--) {
        trail[i].x = trail[i - 1].x;
        trail[i].y = trail[i - 1].y;
      }
      trail[0].x = headX;
      trail[0].y = headY;

      if (opacity > 0.001) {
        for (let i = trail.length - 1; i >= 0; i--) {
          const t = 1 - i / trail.length;
          const pointAlpha = Math.pow(t, 1.6) * opacity;
          if (pointAlpha <= 0.01) continue;
          const r = blobRadius * (0.55 + 0.45 * t);

          ctx.save();
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = pointAlpha;
          ctx.drawImage(backImg, back.dx, back.dy, back.dw, back.dh);
          ctx.restore();
        }
      }

      if (pointerActive || opacity > 0.001) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };

    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e);
      targetX = x;
      targetY = y;
      if (headX === -9999) {
        headX = x;
        headY = y;
        trail.forEach((p) => {
          p.x = x;
          p.y = y;
        });
      }
      pointerActive = true;
      lastMoveTime = performance.now();
      wake();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      lastMoveTime = performance.now();
      wake();
    };

    const ro = new ResizeObserver(() => {
      rebuild();
      wake();
    });
    ro.observe(container);
    rebuild();

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
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
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}