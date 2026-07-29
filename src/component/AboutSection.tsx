"use client";

import React from "react";
import Shuffle from "./Shuffle";

interface AboutSectionProps {
  label?: string;
  heading?: string;
  imageSrc?: string;
  imageAlt?: string;
  certificationLabel?: string;
  certificationTitle?: string;
  certificationDate?: string;
  certificationDesc?: string;
  children?: React.ReactNode;
  className?: string;
}

const DEFAULT_CONTENT = (
  <>
    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
      For over two decades, I've led design at the intersection of human behavior and business performance — scaling UX teams, shaping product strategy, and making design a boardroom conversation.
    </p>

    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
      At <span className="font-semibold text-black">United Electronics Co. (eXtra)</span>, I built and led a multidisciplinary UX organization across KSA, Oman, and Bahrain — growing online revenue to <span className="font-semibold text-black">SAR 1.22B</span>, launching the Jood loyalty platform, and delivering a zero-regression migration across millions of users.
    </p>

    <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
      Outside my corporate role, I founded <span className="font-semibold text-black">Enrichly</span> — an AI-powered PDP content platform — and mentor the next generation of UX leaders through ADPList.
    </p>

    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
      I hold the Nielsen Norman Group VP/Director Specialty Track certification, with focus areas in DesignOps, Leading UX Teams, and Lean UX & Agile.
    </p>
  </>
);

export default function AboutSection({
  label = "// ABOUT",
  heading = "23 years building UX organizations that outperform.",
  imageSrc = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
  imageAlt = "Profile",
  certificationLabel = "NN/G UP - DIRECTOR TRACK",
  certificationTitle = "Nielsen Norman Group — UX Management",
  certificationDate = "VP/Director Specialty Track · Certified Sep 2020",
  certificationDesc = "DesignOps, Leading UX Teams, Lean UX & Agile",
  children = DEFAULT_CONTENT,
  className = "",
}: AboutSectionProps) {
  return (
    <section className={`w-full bg-white py-16 md:py-24 px-6 md:px-12 lg:px-16 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <div className="mb-8 md:mb-12">
          <p className="text-xs md:text-sm font-mono text-red-500 tracking-widest uppercase font-bold">
            {label}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Image */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-200">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Certification Box */}
            {/* <div className="absolute bottom-6 left-6 bg-white border-l-4 border-red-500 p-4 shadow-lg max-w-xs">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                {certificationLabel}
              </p>
              <h4 className="text-sm font-bold text-black mb-2">
                {certificationTitle}
              </h4>
              <p className="text-xs text-gray-600 mb-2">{certificationDate}</p>
              <p className="text-xs text-gray-700">{certificationDesc}</p>
            </div> */}
          </div>

          {/* Right: Content */}
          <div>
            {/* Heading with Shuffle */}
            <Shuffle
              text={heading}
              tag="h1"
              className="mb-8 md:mb-12 text-4xl md:text-5xl leading-tight"
              style={{
                color: "black",
                textAlign: "left",
              }}
              shuffleDirection="up"
              shuffleTimes={2}
              duration={0.35}
              stagger={0.02}
              ease="power3.out"
              triggerOnce={true}
              triggerOnHover={true}
              animationMode="evenodd"
            />

            {/* Body Text */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}