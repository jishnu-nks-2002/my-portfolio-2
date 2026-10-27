"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import HoverLink from "./HoverLink";

interface NavItem {
  label: string;
  hoverLabel: string;
  /** Section id on the page, without the # */
  id: string;
}

interface FloatingNavbarProps {
  logoText?: string;
  items?: NavItem[];
  ctaLabel?: string;
  ctaId?: string;
}

/* ---------- sections on the page (must match the ids in page.tsx) ---------- */

const DEFAULT_ITEMS: NavItem[] = [
  { label: "Intro", hoverLabel: "Hello", id: "intro" },
  { label: "About", hoverLabel: "Who I Am", id: "about" },
  { label: "Skills", hoverLabel: "My Stack", id: "expertise" },
  { label: "Experience", hoverLabel: "My Journey", id: "experience" },
  { label: "Projects", hoverLabel: "See Work", id: "projects" },
];

const BRAND = "#e84020";

/* ---------- hooks ---------- */

/** true = scrolling down past the threshold (hide), false = scrolling up (show). */
function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      // ignore tiny jitters (trackpads, mobile bounce) so it doesn't flicker
      if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY && y > threshold);
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

/** Which section is in the middle of the screen right now ("" = the top banner). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        // the last section (in page order) that crosses the middle band wins
        const current = ids.filter((id) => visible.get(id)).pop();
        if (current) setActive(current);
        else if (window.scrollY < window.innerHeight * 0.5) setActive(""); // back on the banner
      },
      // a thin band across the middle of the viewport
      { rootMargin: "-45% 0px -50% 0px" }
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}

/* ---------- component ---------- */

export default function FloatingNavbar({
  logoText = "Jishnu Narayanan",
  items = DEFAULT_ITEMS,
  ctaLabel = "Let's Talk",
  ctaId = "contact",
}: FloatingNavbarProps) {
  const scrollHidden = useHideOnScroll();
  const [ids] = useState(() => [...items.map((i) => i.id), ctaId]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);

  // never hide the bar while the mobile menu is open
  const hidden = scrollHidden && !open;

  // close the mobile menu with Escape, and lock page scroll while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (!id) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      <div
        className={`fixed inset-x-0 top-5 z-50 flex justify-center px-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          hidden ? "-translate-y-[140%]" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Main"
          className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-[#e84020]/25
            bg-gradient-to-r from-[#1a0603]/85 via-[#2a0b05]/80 to-[#1a0603]/85 py-2 pl-5 pr-2 backdrop-blur-md
            shadow-[0_10px_40px_-10px_rgba(232,64,32,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          {/* logo */}
          <a
            href="#"
            onClick={(e) => goTo(e, "")}
            className="shrink-0 text-sm font-bold tracking-tight text-white transition-colors hover:text-[#ff6a4d]"
          >
            {logoText}
            <span style={{ color: BRAND }}>.</span>
          </a>

          {/* desktop links */}
          <ul className="hidden items-center gap-1 text-sm lg:flex">
            {items.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id} className="relative">
                  {/* red pill behind the current section */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full bg-[#e84020]/20 ring-1 ring-[#e84020]/40 transition-all duration-300 ${
                      isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
                    }`}
                  />
                  <span
                    onClickCapture={(e) => goTo(e, item.id)}
                    className={`relative block px-4 py-2 transition-colors duration-300 ${
                      isActive ? "text-white" : "text-white/70 hover:text-[#ff8a6b]"
                    }`}
                  >
                    <HoverLink
                      href={`#${item.id}`}
                      hoverText={item.hoverLabel}
                      className="font-medium"
                    >
                      {item.label}
                    </HoverLink>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {/* CTA */}
            <a
              href={`#${ctaId}`}
              onClick={(e) => goTo(e, ctaId)}
              className={`group/cta inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white
                bg-gradient-to-r from-[#e84020] to-[#ff5a33] shadow-[0_8px_24px_-8px_rgba(232,64,32,0.9)]
                transition-all duration-300 hover:shadow-[0_10px_30px_-6px_rgba(255,90,51,1)] hover:brightness-110
                ${active === ctaId ? "ring-2 ring-white/60" : ""}`}
            >
              {ctaLabel}
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              />
            </a>

            {/* mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#e84020]/15 text-white ring-1 ring-[#e84020]/35 transition-colors hover:bg-[#e84020]/30 lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* ---------- mobile menu ---------- */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-[#0d0302]/80 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* panel */}
        <div
          className={`absolute inset-x-4 top-24 overflow-hidden rounded-3xl border border-[#e84020]/25
            bg-gradient-to-b from-[#2a0b05] to-[#140402] p-3 shadow-[0_30px_80px_-20px_rgba(232,64,32,0.5)]
            transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
        >
          <ul className="flex flex-col">
            {[...items, { label: "Contact", hoverLabel: "", id: ctaId }].map((item, i) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => goTo(e, item.id)}
                    tabIndex={open ? 0 : -1}
                    className={`flex items-center justify-between rounded-2xl px-5 py-4 text-2xl font-bold transition-colors ${
                      isActive ? "bg-[#e84020] text-white" : "text-white/85 hover:bg-[#e84020]/15"
                    }`}
                    style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className={`font-mono text-xs ${isActive ? "text-white/80" : "text-[#e84020]"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </span>
                    <ArrowUpRight size={20} className={isActive ? "opacity-100" : "opacity-40"} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}