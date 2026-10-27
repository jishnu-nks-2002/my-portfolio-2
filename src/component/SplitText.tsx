"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
  /** If false, the animation plays immediately on mount instead of waiting for scroll into view. Default true. */
  animateOnScroll?: boolean;
  /** Delay (ms) before the animation starts, only used when animateOnScroll is false. */
  startDelay?: number;
  onLetterAnimationComplete?: () => void;
}

/** Reads font status synchronously, so a remount (e.g. the banner's rotating text)
 *  doesn't render one frame of un-animated text before the split kicks in. */
const fontsAreReady = () =>
  typeof document !== "undefined" && (!document.fonts || document.fonts.status === "loaded");

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  animateOnScroll = true,
  startDelay = 0,
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLElement>(null);
  const completedTextRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(fontsAreReady);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (fontsLoaded) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fontsLoaded]);

  useGSAP(
    () => {
      const el = ref.current as
        | (HTMLElement & { _rbsplitInstance?: GSAPSplitText })
        | null;
      if (!el || !text || !fontsLoaded) return;

      // Already played for this exact text → just show it, don't replay.
      if (completedTextRef.current === text) {
        el.style.visibility = "visible";
        return;
      }

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        targets = [];
        if (splitType.includes("chars") && self.chars?.length) targets = self.chars;
        if (!targets.length && splitType.includes("words") && self.words?.length) targets = self.words;
        if (!targets.length && splitType.includes("lines") && self.lines?.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines || [];
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              delay: animateOnScroll ? 0 : startDelay / 1000,
              scrollTrigger: animateOnScroll
                ? { trigger: el, start, once: true, fastScrollEnd: true }
                : undefined,
              force3D: true,
              onComplete: () => {
                completedTextRef.current = text;
                onCompleteRef.current?.();
              },
            }
          );
        },
      });
      el._rbsplitInstance = splitInstance;

      // Chars are now hidden by the "from" state — safe to reveal the element.
      // Plain style (not gsap.set) so useGSAP's auto-revert doesn't hide it again.
      el.style.visibility = "visible";

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        animateOnScroll,
        startDelay,
      ],
      scope: ref,
    }
  );

  const Tag = (tag || "p") as React.ElementType;

  return (
    <Tag
      ref={ref}
      // hidden until the split has applied the "from" state → no flash of full text
      style={{ textAlign, overflowWrap: "break-word", visibility: "hidden" }}
      className={`split-parent overflow-hidden inline-block ${className}`}
    >
      {text}
    </Tag>
  );
};

export default SplitText;