"use client";

import React, { useRef, useState } from "react";
import { gsap } from "gsap";

interface HoverLinkProps {
  href: string;
  children: string;
  hoverText: string;
  className?: string;
}

/**
 * HoverLink
 * ------------------------------------------------------------------
 * Two different text strings: one visible by default, one revealed on hover.
 * On hover: the default text flips up and out while the hover text flips
 * up into place, staggered character by character.
 * ------------------------------------------------------------------
 */
export default function HoverLink({ href, children, hoverText, className = "" }: HoverLinkProps) {
  const topRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const defaultChars = children.split("");
  const hoverChars = hoverText.split("");
  // Ensure both have the same length by padding with spaces
  const maxLen = Math.max(defaultChars.length, hoverChars.length);
  while (defaultChars.length < maxLen) defaultChars.push(" ");
  while (hoverChars.length < maxLen) hoverChars.push(" ");

  const handleEnter = () => {
    if (!topRef.current || !bottomRef.current) return;
    setIsHovering(true);
    
    gsap.killTweensOf(topRef.current.children);
    gsap.killTweensOf(bottomRef.current.children);

    gsap.to(topRef.current.children, {
      yPercent: -120,
      stagger: 0.02,
      duration: 0.4,
      ease: "power3.inOut",
    });
    gsap.to(bottomRef.current.children, {
      yPercent: -120,
      stagger: 0.02,
      duration: 0.4,
      ease: "power3.inOut",
    });
  };

  const handleLeave = () => {
    if (!topRef.current || !bottomRef.current) return;
    setIsHovering(false);
    
    gsap.killTweensOf(topRef.current.children);
    gsap.killTweensOf(bottomRef.current.children);

    gsap.to(topRef.current.children, {
      yPercent: 0,
      stagger: 0.02,
      duration: 0.35,
      ease: "power3.inOut",
    });
    gsap.to(bottomRef.current.children, {
      yPercent: 120,
      stagger: 0.02,
      duration: 0.35,
      ease: "power3.inOut",
    });
  };

  return (
    
     <a href={href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative inline-block overflow-hidden leading-none ${className}`}
    >
      {/* invisible sizer — use the longer of the two texts */}
      <span className="invisible whitespace-nowrap">
        {children.length > hoverText.length ? children : hoverText}
      </span>

      {/* default text — flips upward out of view on hover */}
      <span ref={topRef} className="absolute left-0 top-0 whitespace-nowrap text-white/80">
        {defaultChars.map((c, i) => (
          <span key={`top-${i}`} className="inline-block will-change-transform">
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>

      {/* hover text — starts below and flips into place on hover */}
      <span
        ref={bottomRef}
        className="absolute left-0 top-0 whitespace-nowrap text-orange-400"
      >
        {hoverChars.map((c, i) => (
          <span
            key={`bottom-${i}`}
            className="inline-block will-change-transform"
            style={{ transform: "translateY(120%)" }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>
    </a>
  );
}