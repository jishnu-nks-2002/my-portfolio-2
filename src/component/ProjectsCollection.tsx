"use client";

import React from "react";
import ProjectShowcaseGallery from "./ProjectShowcaseGallery";

interface DummyProject {
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  ctaLabel: string;
  ctaHref: string;
  videoSrc: string;
  poster: string;
  accentColor: string;
}

// Publicly hosted sample videos — swap these for your real project clips.
const DUMMY_PROJECTS: DummyProject[] = [
  {
    eyebrow: "EGYPT FA · CLAUDE CODE",
    title: "Egypt Kit WC 2026.",
    description:
      "Official-feel concept kit reveal for Egypt's 2026 FIFA World Cup campaign — cinematic product landing built with motion-first design and national pride.",
    tags: ["WC 2026", "Kit Reveal", "Claude Code"],
    ctaLabel: "VIEW LIVE",
    ctaHref: "https://example.com/egypt-kit",
    videoSrc:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    accentColor: "#c81e2c",
  },
  {
    eyebrow: "AMG · MOTION STUDY",
    title: "GT Black Series.",
    description:
      "A dark, chrome-lit product teaser exploring reflections and light trails for a concept automotive reveal page.",
    tags: ["Automotive", "WebGL", "Claude Code"],
    ctaLabel: "VIEW LIVE",
    ctaHref: "https://example.com/amg-gt",
    videoSrc:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    accentColor: "#f59e0b",
  },
  {
    eyebrow: "PERSONAL · EXPERIMENT",
    title: "Signal Lab.",
    description:
      "An audio-reactive visualizer experiment built to explore GSAP timelines synced to Web Audio frequency data.",
    tags: ["Creative Dev", "Three.js", "Audio"],
    ctaLabel: "VIEW LIVE",
    ctaHref: "https://example.com/signal-lab",
    videoSrc:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    accentColor: "#22c55e",
  },
  {
    eyebrow: "CLIENT · E-COMMERCE",
    title: "Northfield Goods.",
    description:
      "A Shopify storefront rebuild focused on fast product discovery, editorial-style merchandising, and checkout conversion.",
    tags: ["Shopify", "E-Commerce", "Performance"],
    ctaLabel: "VIEW LIVE",
    ctaHref: "https://example.com/northfield-goods",
    videoSrc:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster:
      "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
    accentColor: "#3b82f6",
  },
];

export default function ProjectsCollection() {
  return (
    <div className="relative w-full bg-black">
      <ProjectShowcaseGallery projects={DUMMY_PROJECTS} />
    </div>
  );
}