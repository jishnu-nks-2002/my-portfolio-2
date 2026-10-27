"use client";

import { useRef, useEffect, useState, type RefObject } from "react";

interface CustomCursorProps {
  /** Size (px) of the center dot that follows the pointer exactly. 0 hides it. */
  size?: number;
  /** Ring size (px) normally. */
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
  /**
   * Only show the custom cursor while the pointer is inside this element.
   * Without it, the cursor shows across the whole page.
   */
  scopeRef?: RefObject<HTMLElement | null>;
}

export default function CustomCursor({
  size = 8,
  ringSize = 36,
  hoverRingSize = 88,
  color = "#f97316",
  mixBlendMode = "normal",
  interactiveSelector = "a, button, [data-cursor-label]",
  scopeRef,
}: CustomCursorProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  // One effect for the whole lifetime. Hover changes are tracked in a ref, so the
  // listeners and animation loop are never torn down mid-move (that caused the
  // ring to jump to the top-left corner before).
  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;
    let visible = false;
    let initialized = false;
    let currentTarget: HTMLElement | null = null;

    const setVisible = (v: boolean) => {
      if (visible === v) return;
      visible = v;
      ring.style.opacity = v ? "1" : "0";
      dot.style.opacity = v ? "1" : "0";
    };

    const setTarget = (el: HTMLElement | null) => {
      if (el === currentTarget) return;
      currentTarget = el;
      hoveringRef.current = !!el;
      setHovering(!!el);
      setLabel(el?.dataset.cursorLabel ?? "");
    };

    const inScope = (node: Element | null) => {
      const scope = scopeRef?.current;
      if (!scope) return true;
      return !!node && scope.contains(node);
    };

    // Ring follows with a lag; loop stops by itself once the ring has caught up.
    const tick = () => {
      const ease = hoveringRef.current ? 0.15 : 0.1;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (Math.abs(mouseX - ringX) < 0.1 && Math.abs(mouseY - ringY) < 0.1) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const hide = () => {
      setVisible(false);
      setTarget(null);
      initialized = false;
    };

    const update = (node: Element | null) => {
      if (!inScope(node)) {
        hide();
        return;
      }
      if (!initialized) {
        ringX = mouseX;
        ringY = mouseY;
        initialized = true;
      }
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      setVisible(true);
      const el = (node?.closest?.(interactiveSelector) as HTMLElement | null) ?? null;
      setTarget(el && inScope(el) ? el : null);
      startLoop();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      update(e.target as Element | null);
    };

    // Scrolling moves content under a still mouse — re-check what's under it.
    const onScroll = () => {
      if (!initialized && !scopeRef) return;
      update(document.elementFromPoint(mouseX, mouseY));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, [interactiveSelector, scopeRef]);

  const ringDiameter = hovering ? hoverRingSize : ringSize;

  return (
    <>
      {/* lagging ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: ringDiameter,
          height: ringDiameter,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          willChange: "transform",
          transition:
            "opacity 0.25s ease, width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
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

      {/* exact-position dot (fades out while hovering so it doesn't sit on the label) */}
      {size > 0 && (
        <div
          ref={dotRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 10000,
            opacity: 0,
            willChange: "transform",
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              transform: hovering ? "scale(0)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      )}
      {size <= 0 && <div ref={dotRef} style={{ display: "none" }} />}
    </>
  );
}