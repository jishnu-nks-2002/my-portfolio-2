"use client";

import React from "react";
import Shuffle from "./Shuffle";

interface IntroSectionProps {
  label?: string;
  heading: string;
  /** Words to highlight in orange (array of strings) */
  accentWords?: string[];
  className?: string;
}

export default function IntroSection({
  label = "// INTRO",
  heading = "I'm a senior UX executive who turns design organizations into revenue engines. 23 years of strategy, systems, and scale — across e-commerce, enterprise, and AI-driven products.",
  accentWords = ["design", "organizations", "revenue engines", "23 years", "scale"],
  className = "",
}: IntroSectionProps) {
  // Function to split heading into parts and highlight accent words
  const renderHeading = () => {
    let remaining = heading;
    const parts: (string | { text: string; isAccent: boolean })[] = [];

    for (const word of accentWords) {
      const regex = new RegExp(`(${word})`, "gi");
      const split = remaining.split(regex);

      if (split.length === 1) continue;

      // Process the first segment before any accent word
      if (!parts.length && split[0]) {
        parts.push(split[0]);
      }

      // Process alternating segments
      for (let i = 1; i < split.length; i++) {
        if (i % 2 === 1) {
          // This is an accent word
          parts.push({ text: split[i], isAccent: true });
        } else if (split[i]) {
          // This is regular text
          parts.push(split[i]);
        }
      }

      // Update remaining for next iteration
      remaining = parts
        .slice(-1)[0]
        ? typeof parts.slice(-1)[0] === "string"
          ? (parts.slice(-1)[0] as string)
          : ""
        : "";
    }

    return parts;
  };

  const headingParts = renderHeading();

  return (
    <section className={`w-full bg-black py-24 px-8 md:px-16 lg:px-24 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <div className="mb-12 md:mb-20">
          <p className="text-xs md:text-sm font-mono text-[#e84020] tracking-widest uppercase">
            {label}
          </p>
        </div>

        {/* Main Heading with Shuffle Animation */}
        <div className="space-y-8">
          <Shuffle
            text={heading}
            tag="h1"
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight"
            style={{
              color: "white",
              textAlign: "left",
            }}
            shuffleDirection="right"
            shuffleTimes={2}
            duration={0.4}
            stagger={0.02}
            ease="power3.out"
            colorFrom="#ffffff"
            colorTo="#ffffff"
            triggerOnce={true}
            triggerOnHover={true}
            animationMode="evenodd"
            maxDelay={0.15}
          />
        </div>

        {/* Accent Words Highlight - Optional visual indicator */}
        <div className="mt-16 flex flex-wrap gap-3">
          {accentWords.map((word, idx) => (
            <span
              key={idx}
              className="px-4 py-2 border border-[#e84020] rounded-full text-xs md:text-sm text-[#e84020] font-medium"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}