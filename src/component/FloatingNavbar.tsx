"use client";
import React, { useEffect, useState } from "react";
import HoverLink from "../component/HoverLink";

interface NavItem {
  label: string;
  hoverLabel: string;
  href: string;
}

interface FloatingNavbarProps {
  logoText?: string;
  items?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

/** Tracks scroll direction: true = scrolling down past the threshold (hide), false = scrolling up (show). */
function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      // Ignore tiny jitters (trackpads, mobile bounce) so it doesn't flicker.
      if (Math.abs(y - lastY) > 4) {
        if (y > lastY && y > threshold) {
          setHidden(true);
        } else {
          setHidden(false);
        }
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}

const DEFAULT_ITEMS: NavItem[] = [
  { label: "About", hoverLabel: "About Us", href: "#about" },
  { label: "Career", hoverLabel: "Join Us", href: "#career" },
  { label: "Experiments", hoverLabel: "See More", href: "#experiments" },
  { label: "Founder", hoverLabel: "Meet Me", href: "#founder" },
  { label: "Tools", hoverLabel: "Explore", href: "#tools" },
];

export default function FloatingNavbar({
  logoText = "Mohamed Shehata",
  items = DEFAULT_ITEMS,
  ctaLabel = "Let's Talk",
  ctaHref = "#contact",
}: FloatingNavbarProps) {
  const hidden = useHideOnScroll();

  return (
    <div
      className={`fixed top-5 inset-x-0 z-50 flex justify-center px-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden ? "-translate-y-[140%]" : "translate-y-0"
      }`}
    >
      <nav className="flex w-full max-w-4xl items-center justify-between gap-6 rounded-full border border-white/10 bg-black/60 px-3 py-2 pl-6 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        {/* logo */}
        <a href="#" className="shrink-0 text-sm font-bold tracking-tight text-white">
          {logoText}
          <span className="text-orange-500">.</span>
        </a>

        {/* nav links */}
        <ul className="hidden md:flex items-center gap-7 text-sm text-white/80">
          {items.map((item) => (
            <li key={item.href}>
              <HoverLink 
                href={item.href} 
                hoverText={item.hoverLabel}
                className="font-medium"
              >
                {item.label}
              </HoverLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        
         <a href={ctaHref}
          className="shrink-0 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-orange-400"
        >
          {ctaLabel}
        </a>
      </nav>
    </div>
  );
}