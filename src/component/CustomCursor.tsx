"use client";

import { useRef, useEffect, useState } from "react";

interface CustomCursorProps {
  ringSize?: number;
  /** Ring size (px) while hovering an interactive element. */
  hoverRingSize?: number;
  color?: string;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  /**
   * CSS selector for elements that trigger the "hover" state.
   * Add `data-cursor-label="View"` on any matched element to show text inside the ring.
   */
  interactiveSelector?: string;
}

export default function CustomCursor({
  ringSize = 36,
  hoverRingSize = 88,
  color = "#f97316",
  mixBlendMode = "normal",
  interactiveSelector = "a, button, [data-cursor-label]",
}: CustomCursorProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    let ringX = 0,
      ringY = 0;
    let mouseX = 0,
      mouseY = 0;
    let raf = 0;
    let isInitialized = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // On first movement, initialize ring position to mouse position (no lag)
      if (!isInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        isInitialized = true;
      }

      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    const onLeaveWindow = () => {
      if (ringRef.current) ringRef.current.style.opacity = "0";
      isInitialized = false;
    };

    const animateRing = () => {
      // slightly snappier lag while hovering, so the ring "catches" the target
      const ease = hovering ? 0.15 : 0.1;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animateRing);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector) as HTMLElement | null;
      if (target) {
        setHovering(true);
        setLabel(target.dataset.cursorLabel || "");
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector);
      const related = (e.relatedTarget as HTMLElement | null)?.closest?.(interactiveSelector);
      if (target && target !== related) {
        setHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, [hovering, interactiveSelector]);

  return (
    <div
      ref={ringRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: hovering ? hoverRingSize : ringSize,
        height: hovering ? hoverRingSize : ringSize,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        transition:
          "opacity 0.25s ease, width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease",
        mixBlendMode,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}