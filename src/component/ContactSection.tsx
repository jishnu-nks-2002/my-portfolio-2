"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Download, Eye, Mail, MapPin, Phone, Copy, Check, ArrowUp } from "lucide-react";
import TiltCard from "./TiltCard";
import dynamic from "next/dynamic";

// 3D lanyard (three.js) — loaded only in the browser, and only when the section is near,
// so it doesn't add weight to the first page load.
const LanyardBadge = dynamic(() => import("./LanyardBadge"), { ssr: false });

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ---------- brand icons (inline SVG — no extra package, works with any lucide version) ---------- */

function WhatsAppIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.03c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.2-4.24 9.44-9.44 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.79.7.69 5.8.69 12.06c0 2 .52 3.96 1.52 5.68L.6 23.3l5.7-1.5a11.33 11.33 0 0 0 5.75 1.47h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.03-1.18-5.89-3.33-8.03z" />
    </svg>
  );
}

function InstagramIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

/* ---------- props ---------- */

interface ContactSectionProps {
  id?: string;
  label?: string;
  email?: string;
  /** Digits only, with country code — used for the WhatsApp and call links. */
  phone?: string;
  /** How the phone number is shown. */
  phoneDisplay?: string;
  whatsappMessage?: string;
  linkedinUrl?: string;
  linkedinHandle?: string;
  /** ⚠ Set these to your real Instagram profile. */
  instagramUrl?: string;
  instagramHandle?: string;
  /** PDF in /public — e.g. /public/cv/Jishnu_Narayanan_Resume.pdf */
  cvUrl?: string;
  cvFileName?: string;
  location?: string;
  name?: string;
  /** Your photo for the ID card on the lanyard (in /public). */
  portraitSrc?: string;
  className?: string;
}

/** Matches Tailwind's lg breakpoint. */
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** True once the element comes near the viewport — delays the 3D lanyard until it's needed. */
function useNearViewport<T extends Element>(ref: React.RefObject<T | null>, rootMargin = "500px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}

export default function ContactSection({
  id = "contact",
  label = "// CONTACT",
  email = "jishnunarayanan2002@gmail.com",
  phone = "917012521841",
  phoneDisplay = "+91 70125 21841",
  whatsappMessage = "Hi Jishnu! I saw your portfolio and would like to talk about a project.",
  linkedinUrl = "https://www.linkedin.com/in/jishnu-narayanan-ks?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  linkedinHandle = "in/jishnu-narayanan-ks",
  instagramUrl = "https://www.instagram.com/_._j_._u_._?rpxt=ODA4cW05ZjFnb3dq",
  instagramHandle = "_._j_._u_._",
  cvUrl = "/cv/Jishnu_Narayanan_Resume.pdf",
  cvFileName = "Jishnu_Narayanan_Resume.pdf",
  location = "Thrissur, Kerala · India",
  name = "Jishnu Narayanan",
  portraitSrc = "/images/footer-img.png",
  className = "",
}: ContactSectionProps) {
  const rootRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitNear = useNearViewport(portraitRef);
  const isDesktop = useIsDesktop();
  const [copied, setCopied] = useState(false);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;

  const tiles = [
    {
      key: "whatsapp",
      name: "WhatsApp",
      handle: phoneDisplay,
      action: "Chat now",
      href: whatsappUrl,
      icon: <WhatsAppIcon />,
      surface: "!bg-[#25D366]",
      ink: "text-white",
    },
    {
      key: "instagram",
      name: "Instagram",
      handle: instagramHandle,
      action: "Follow",
      href: instagramUrl,
      icon: <InstagramIcon />,
      surface:
        "!bg-[linear-gradient(135deg,#feda75_0%,#fa7e1e_25%,#d62976_55%,#962fbf_80%,#4f5bd5_100%)]",
      ink: "text-white",
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      handle: linkedinHandle,
      action: "Connect",
      href: linkedinUrl,
      icon: <LinkedinIcon />,
      surface: "!bg-[#0A66C2]",
      ink: "text-white",
    },
    {
      key: "email",
      name: "Email",
      handle: email,
      action: "Write to me",
      href: `mailto:${email}`,
      icon: <Mail size={40} strokeWidth={1.8} aria-hidden="true" />,
      surface: "!bg-[#e84020]",
      ink: "text-white",
    },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  const backToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  // entrance animations — each plays once
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".contact-word", {
          autoAlpha: 0,
          y: 60,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.06,
          clearProps: "transform",
          scrollTrigger: { trigger: ".contact-head", start: "top 85%", once: true },
        });
        gsap.from(".contact-portrait", {
          autoAlpha: 0,
          y: 60,
          scale: 0.96,
          duration: 1.1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: ".contact-head", start: "top 80%", once: true },
        });
        gsap.from(".contact-tile", {
          autoAlpha: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform",
          scrollTrigger: { trigger: ".contact-tiles", start: "top 85%", once: true },
        });
        gsap.from(".contact-cv", {
          autoAlpha: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: { trigger: ".contact-cv", start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative isolate w-full overflow-clip bg-black px-6 pt-24 pb-10 text-white md:px-12 md:pt-32 lg:px-16 ${className}`}
    >
      {/* warm glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] -z-10 h-[620px] w-[620px] rounded-full bg-[#e84020]/25 blur-[140px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[-10%] -z-10 h-[480px] w-[480px] rounded-full bg-[#8a2c10]/30 blur-[130px]" />

      <div className="mx-auto max-w-7xl">
        {/* ---------- heading ---------- */}
        <div className="contact-head relative">
          <p className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020] md:text-sm">
            {label}
          </p>

          <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div>
          <h2
            id={`${id}-heading`}
            className="text-[clamp(3rem,7.5vw,7.5rem)] font-bold leading-[0.95] tracking-tight"
          >
            <span className="contact-word inline-block">Let&apos;s</span>{" "}
            <span className="contact-word inline-block">build</span>{" "}
            <span className="contact-word inline-block font-serif font-normal italic text-[#e84020]">something</span>{" "}
            <span className="contact-word inline-block">great</span>{" "}
            <span className="contact-word inline-block">together.</span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            Have a project, a role or just an idea? Pick whichever way suits you — I usually reply
            within a day.
          </p>
          </div>

          {/* ---------- 3D lanyard ID card — drag to swing, tap to flip ----------
              Phones: sits under the heading.
              Desktop: pulled out of the grid and pinned to the right, starting at the very top of
              the section (-top-32 cancels the section's top padding), so the strap hangs from the top
              edge. No box, border or fade around it — the canvas is transparent. */}
          <div ref={portraitRef} className="contact-portrait relative w-full lg:static">
            <div
              className="relative h-[520px] w-full sm:h-[580px]
                [mask-image:linear-gradient(to_bottom,transparent,#000_10%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_10%)]
                lg:absolute lg:-top-32 lg:bottom-0 lg:-right-16 lg:h-auto lg:w-[54%]
                lg:[mask-image:none] lg:[-webkit-mask-image:none]"
              role="img"
              aria-label={`ID card for ${name}, MERN Stack Developer — drag to swing, tap to flip`}
            >
              {portraitNear && (
                <LanyardBadge
                  photo={portraitSrc}
                  name={name}
                  role="MERN Stack Developer"
                  title="Jr. Software Engineer · Mindstory"
                  email={email}
                  phone={phoneDisplay}
                  location={location}
                  // taller box on desktop → slightly smaller share for the card, longer strap
                  size={isDesktop ? 0.6 : 0.56}
                  strapLength={isDesktop ? 0.45 : 0.62}
                />
              )}
              <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-[10px] uppercase tracking-widest text-white/35 md:text-xs">
                Drag to swing · Tap to flip
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* ---------- big contact tiles ---------- */}
        <div className="contact-tiles mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-6">
          {tiles.map((t) => (
            <TiltCard
              key={t.key}
              className="contact-tile"
              cardClassName={`${t.surface} ${t.ink} !p-0`}
              maxTilt={9}
            >
              <a
                href={t.href}
                target={t.key === "email" ? undefined : "_blank"}
                rel={t.key === "email" ? undefined : "noopener noreferrer"}
                data-cursor-label={t.action}
                aria-label={`${t.name}: ${t.handle}`}
                className="relative flex h-full min-h-[240px] flex-col justify-between rounded-3xl p-7 [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 md:min-h-[300px] md:p-8"
              >
                {/* icon — front layer, grows on hover */}
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 transition-transform duration-500 [transform:translateZ(60px)] group-hover:scale-110 md:h-24 md:w-24">
                  {t.icon}
                </span>

                <span className="block [transform:translateZ(35px)]">
                  <span className="block text-2xl font-bold md:text-3xl">{t.name}</span>
                  <span className="mt-1 block truncate text-sm opacity-80">{t.handle}</span>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-semibold">
                    {t.action}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </a>
            </TiltCard>
          ))}
        </div>

        {/* ---------- CV download ---------- */}
        <div className="contact-cv relative mt-6 overflow-hidden rounded-3xl bg-white p-8 text-black md:mt-8 md:p-12">
          {/* big faded "CV" in the background */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 right-4 select-none text-[11rem] font-black leading-none text-neutral-100 md:text-[16rem]"
          >
            CV
          </span>

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-[#e84020]">
                Résumé
              </p>
              <h3 className="text-3xl font-bold leading-tight md:text-5xl">Grab my CV</h3>
              <p className="mt-3 text-base text-neutral-600 md:text-lg">
                Experience, projects and skills in one page — PDF, about 95 KB.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={cvUrl}
                download={cvFileName}
                data-cursor-label="Download"
                className="group/cv inline-flex items-center gap-3 rounded-full bg-[#e84020] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-14px_rgba(232,64,32,0.8)] transition-transform duration-300 hover:-translate-y-0.5 md:text-lg"
              >
                <Download size={22} className="transition-transform duration-300 group-hover/cv:translate-y-0.5" />
                Download CV
              </a>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-label="View"
                className="inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-base font-semibold text-white transition-colors duration-300 hover:bg-neutral-800 md:text-lg"
              >
                <Eye size={22} />
                View
              </a>
            </div>
          </div>
        </div>

        {/* ---------- footer strip ---------- */}
        <div className="mt-20 flex flex-col gap-8 border-t border-white/10 pt-8 md:mt-28 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <button
              type="button"
              onClick={copyEmail}
              data-cursor-label={copied ? "Copied" : "Copy"}
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "Email copied!" : email}
            </button>
            <a href={`tel:+${phone}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
              <Phone size={16} /> {phoneDisplay}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} /> {location}
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 text-sm text-white/40 md:justify-end">
            <span>
              © {new Date().getFullYear()} {name}
            </span>
            <button
              type="button"
              onClick={backToTop}
              aria-label="Back to top"
              data-cursor-label="Top"
              className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#e84020]"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}