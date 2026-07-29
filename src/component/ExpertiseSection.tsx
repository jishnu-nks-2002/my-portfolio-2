"use client";

import React from "react";
import LightRays from "./LightRays";
import Shuffle from "./Shuffle";

interface SkillCategory {
  number: string;
  name: string;
  skills: string[];
}

interface ExpertiseSectionAltProps {
  label?: string;
  heading?: string;
  categories?: SkillCategory[];
  className?: string;
}

const DEFAULT_CATEGORIES: SkillCategory[] = [
  {
    number: "01",
    name: "Frontend",
    skills: [
      "React & Next.js",
      "Vue.js & Nuxt",
      "TypeScript & JavaScript",
      "Three.js & WebGL",
      "Tailwind CSS & Styling",
      "Responsive Design",
      "Progressive Web Apps (PWA)",
      "Accessibility (A11y)",
    ],
  },
  {
    number: "02",
    name: "Backend & Data",
    skills: [
      "Node.js & Express",
      "REST APIs & GraphQL",
      "MongoDB & PostgreSQL",
      "MySQL & Firebase",
      "Authentication & Authorization",
      "API Integration & Webhooks",
      "Payment Gateway Integration",
    ],
  },
  {
    number: "03",
    name: "Platforms & Commerce",
    skills: [
      "WordPress Development",
      "Shopify Theme Development",
      "WooCommerce & Custom Stores",
      "Figma to Code",
      "UI/UX Implementation",
    ],
  },
  {
    number: "04",
    name: "DevOps & Delivery",
    skills: [
      "Git & Version Control",
      "Docker & Containerization",
      "CI/CD Pipelines",
      "AWS & Cloud Deployment",
      "Vercel & Netlify",
      "Performance Optimization",
      "SEO & Web Vitals",
      "Testing (Jest, Vitest)",
      "Cross-browser Compatibility",
      "GSAP & Animation Libraries",
      "Mobile Responsive",
    ],
  },
];

export default function ExpertiseSectionAlt({
  label = "// EXPERTISE & SKILLS",
  heading = "Full Stack Development Capabilities.",
  categories = DEFAULT_CATEGORIES,
  className = "",
}: ExpertiseSectionAltProps) {
  return (
    <section className={`relative w-full bg-black overflow-hidden ${className}`}>
      {/* Light Rays Background */}
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysSpeed={1.2}
          lightSpread={1.5}
          rayLength={2.5}
          pulsating={true}
          fadeDistance={1.2}
          saturation={0.8}
          followMouse={true}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Label */}
          <div className="mb-6 md:mb-10">
            <p className="text-xs md:text-sm font-mono text-orange-500 tracking-widest uppercase">
              {label}
            </p>
          </div>

          {/* Heading */}
          <h2 className="mb-16 md:mb-20 max-w-3xl">
            <Shuffle
              text={heading}
              tag="span"
              textAlign="left"
              className="block font-bold text-white"
              style={{
                textTransform: "none",
                fontSize: "clamp(1.875rem, 4vw, 3rem)",
                lineHeight: 1.2,
              }}
              shuffleDirection="right"
              duration={0.35}
              shuffleTimes={2}
              animationMode="evenodd"
              stagger={0.02}
              colorFrom="#555555"
              colorTo="#ffffff"
              triggerOnce
              triggerOnHover
            />
          </h2>

          {/* Skill Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 lg:gap-x-16">
            {categories.map((category) => (
              <div
                key={category.number}
                className="border-t border-white/10 pt-6"
              >
                {/* Category header */}
                <div className="mb-6 flex items-baseline gap-3">
                  <span className="font-mono text-xs text-[#e84020]">
                    {category.number}
                  </span>
                  <h3 className="text-lg md:text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                </div>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-2.5">
                  {category.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="group cursor-pointer rounded-full border border-white/15 px-4 py-2 transition-colors duration-300 hover:border-[#e84020] hover:bg-[#e84020]/10"
                    >
                      <Shuffle
                        text={skill}
                        tag="span"
                        textAlign="left"
                        className="block font-medium text-white/70 group-hover:text-white transition-colors duration-300"
                        style={{
                          textTransform: "none",
                          fontSize: "0.875rem",
                          lineHeight: 1.3,
                        }}
                        shuffleDirection="right"
                        duration={0.3}
                        shuffleTimes={1}
                        animationMode="evenodd"
                        stagger={0.015}
                        triggerOnce={false}
                        triggerOnHover
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}