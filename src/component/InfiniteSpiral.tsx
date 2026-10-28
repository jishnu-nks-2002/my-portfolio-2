'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from 'react';

/**
 * Infinite 3D spiral of cards.
 *
 * Two motion modes:
 * - `flow`  — the original: a continuous, endless drift.
 * - `step`  — a carousel: glides one card to the front, holds it for `interval` seconds, moves on.
 *             Reports the front card (`onActiveChange`) and can play a video on it.
 *
 * Smoothness notes:
 * - styles are written straight to the DOM (no React re-render per frame), and only when they change
 * - blur is quantised to 0.5px so the browser isn't re-rasterising every card every frame
 * - in `step` mode the loop goes fully idle between moves (a timer wakes it), and it pauses off screen
 * - touch swipes are horizontal so vertical swipes still scroll the page
 */

export interface InfiniteSpiralVideoSource {
  src: string;
  type?: string;
  /** e.g. "(max-width: 767px)" to serve a smaller file to phones */
  media?: string;
}

export interface InfiniteSpiralItem {
  id?: string | number;
  /** image — also the poster shown under (and until) the video */
  src: string;
  alt?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  label?: string;
  /** plays on the front card in `step` mode */
  video?: string | InfiniteSpiralVideoSource[];
}

export interface InfiniteSpiralProps {
  items?: Array<string | InfiniteSpiralItem>;
  /** `flow`: cards per second. */
  speed?: number;
  direction?: 'up' | 'down';
  /** `auto-drag` = auto motion + drag, without page-scroll driving it. */
  animationMode?: 'auto' | 'drag' | 'scroll' | 'all' | 'auto-drag';
  /** `flow` = continuous drift (original), `step` = one card at a time with a pause. */
  mode?: 'flow' | 'step';
  /** `step`: seconds each card stays at the front once it has arrived. */
  interval?: number;
  /** `step`: how quickly a card glides to the front (higher = faster). */
  glideSpeed?: number;
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  perspective?: number;
  cardsPerTurn?: number;
  rotation?: number;
  cardTilt?: number;
  cardRadius?: number;
  centerScale?: number;
  edgeFade?: number;
  edgeBlur?: number;
  /** darken cards away from the front, 0–1 (cheap: an opacity overlay, not a filter) */
  dim?: number;
  pauseOnHover?: boolean;
  imageFit?: CSSProperties['objectFit'];
  grayscale?: number;
  /** vertical position of the spiral's centre, 0–1 of the container height */
  centerY?: number;
  /** `step`: play `video` on the front card */
  videos?: boolean;
  /** `step`: the card at the front changed */
  onActiveChange?: (index: number) => void;
  /** `step`: the front card was clicked (other cards are brought to the front instead) */
  onSelect?: (index: number) => void;
  /** `step`: `{ start, end }` (performance.now time) while the next move is scheduled, `null` while paused */
  onAutoplay?: (timing: { start: number; end: number } | null) => void;
  className?: string;
}

type NormalizedItem = InfiniteSpiralItem & { alt: string };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min: number, max: number, value: number) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

const InfiniteSpiral = ({
  items = [],
  speed = 0.55,
  direction = 'up',
  animationMode = 'auto',
  mode = 'flow',
  interval = 4,
  glideSpeed = 5.5,
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardsPerTurn = 7,
  rotation = 0,
  cardTilt = 0,
  cardRadius = 10,
  centerScale = 1.2,
  edgeFade = 0.3,
  edgeBlur = 6,
  dim = 0,
  pauseOnHover = true,
  imageFit = 'cover',
  grayscale = 0,
  centerY = 0.5,
  videos = true,
  onActiveChange,
  onSelect,
  onAutoplay,
  className = ''
}: InfiniteSpiralProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dimRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const interactedAtRef = useRef(-Infinity);
  const wakeRef = useRef<() => void>(() => {});
  const callbacksRef = useRef({ onActiveChange, onSelect, onAutoplay });
  useEffect(() => {
    callbacksRef.current = { onActiveChange, onSelect, onAutoplay };
  }, [onActiveChange, onSelect, onAutoplay]);

  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(false);
  const [videoShown, setVideoShown] = useState(-1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const normalizedItems = useMemo<NormalizedItem[]>(
    () =>
      items.map((item, index) =>
        typeof item === 'string'
          ? { src: item, alt: `Spiral image ${index + 1}` }
          : { alt: `Spiral image ${index + 1}`, ...item }
      ),
    [items]
  );
  const count = normalizedItems.length;
  const stepMode = mode === 'step';
  const dragEnabled = animationMode === 'drag' || animationMode === 'all' || animationMode === 'auto-drag';

  useEffect(() => {
    const root = rootRef.current;
    if (!root || count === 0) return;

    let frameId = 0;
    let timer = 0;
    let previousTime = performance.now();
    let width = Math.max(root.clientWidth, 1);
    let height = Math.max(root.clientHeight, 1);
    let visible = true;
    let autoSpeed = 0;
    let armed = false;
    let armedAt = 0;
    let lastActive = -1;
    let lastSettled: boolean | null = null;
    let reported: string | null = 'init';
    // last written values, so unchanged styles are never touched
    const cache = Array.from({ length: count }, () => ({ t: '', o: '', f: '', z: '', p: '', d: '' }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const autoEnabled = animationMode === 'auto' || animationMode === 'all' || animationMode === 'auto-drag';
    const scrollEnabled = animationMode === 'scroll' || animationMode === 'all';
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.55;
    const dir = direction === 'down' ? -1 : 1;
    let lastScrollY = window.scrollY;
    let scrollAcc = 0;

    const report = (timing: { start: number; end: number } | null) => {
      const key = timing ? `${timing.start}|${timing.end}` : 'null';
      if (key === reported) return;
      reported = key;
      callbacksRef.current.onAutoplay?.(timing);
    };

    const start = () => {
      if (frameId || !visible) return;
      previousTime = performance.now();
      frameId = requestAnimationFrame(render);
    };
    wakeRef.current = start;

    const resizeObserver = new ResizeObserver(() => {
      width = Math.max(root.clientWidth, 1);
      height = Math.max(root.clientHeight, 1);
      cache.forEach(c => (c.t = ''));
      start();
    });
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        clearTimeout(timer);
        armed = false;
        report(null);
      } else start();
    });
    intersectionObserver.observe(root);
    const onVisibility = () => {
      if (document.hidden) {
        armed = false;
        report(null);
      } else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visible || scrollDelta === 0) return;
      const amount = clamp((scrollDelta * scrollSpeedMultiplier) / Math.max(verticalSpacing * 2, 1), -1.5, 1.5);
      if (stepMode) {
        // whole cards only — collect small scrolls until they add up to one
        scrollAcc += amount;
        const steps = Math.trunc(scrollAcc);
        if (!steps) return;
        scrollAcc -= steps;
        targetProgressRef.current = Math.round(targetProgressRef.current) + steps;
        interactedAtRef.current = performance.now();
      } else {
        targetProgressRef.current += amount;
      }
      start();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const layout = () => {
      const half = count / 2;
      const fit = Math.min(1, width / (cardWidth * 1.5), height / (cardHeight * 2.6));
      const responsiveRadius = Math.min(radius, Math.max(60, width * 0.36)) * fit;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);
      const progress = progressRef.current;

      for (let index = 0; index < count; index++) {
        const card = cardRefs.current[index];
        if (!card) continue;
        const c = cache[index];
        const offset = modulo(index - progress + half, count) - half;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
        const scale = (1 + (centerScale - 1) * focus) * fit;
        const angleRadians = ((offset * (360 / turnSize) + rotation) * Math.PI) / 180;
        const x = Math.sin(angleRadians) * responsiveRadius;
        const z = Math.cos(angleRadians) * responsiveRadius;
        const depthScale = clamp(perspective / Math.max(perspective - z, 1), 0.72, 1.45);
        const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
        const blur = Math.round(edgeBlur * smoothstep(0.35, 1, edge) * 2) / 2;

        const t = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${(offset * verticalSpacing * fit).toFixed(2)}px, 0) rotateZ(${cardTilt}deg) scale(${(scale * depthScale).toFixed(4)})`;
        const o = opacity.toFixed(3);
        const f = blur > 0 ? `blur(${blur}px)` : 'none';
        const zi = String(Math.round(depth * 1000) * 100 + index);
        const p = opacity > 0.25 ? 'auto' : 'none';
        if (t !== c.t) card.style.transform = c.t = t;
        if (o !== c.o) card.style.opacity = c.o = o;
        if (f !== c.f) card.style.filter = c.f = f;
        if (zi !== c.z) card.style.zIndex = c.z = zi;
        if (p !== c.p) card.style.pointerEvents = c.p = p;
        const shade = dimRefs.current[index];
        if (shade) {
          const d = (dim * smoothstep(0, 1.2, Math.abs(offset))).toFixed(2);
          if (d !== c.d) shade.style.opacity = c.d = d;
        }
      }
    };

    const render = (time: number) => {
      frameId = 0;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      const now = performance.now();
      const dragging = draggingRef.current;
      const paused = dragging || (pauseOnHover && hoveredRef.current);
      let keepGoing = false;

      if (!stepMode) {
        // ---- flow: continuous drift (original behaviour) ----
        const desired = autoEnabled && visible && !reducedMotion.matches && !paused ? speed * dir : 0;
        autoSpeed += (desired - autoSpeed) * (1 - Math.exp(-delta * 7));
        targetProgressRef.current += autoSpeed * delta;
        const follow = 1 - Math.exp(-delta * (dragging ? 22 : 11));
        progressRef.current += (targetProgressRef.current - progressRef.current) * follow;
        keepGoing = true;
      } else {
        // ---- step: glide to the target card, rest, then move on ----
        const gap = targetProgressRef.current - progressRef.current;
        if (reducedMotion.matches && !dragging) {
          progressRef.current = targetProgressRef.current;
        } else {
          const follow = 1 - Math.exp(-delta * (dragging ? 20 : glideSpeed));
          progressRef.current += gap * follow;
        }
        const resting = !dragging && Math.abs(targetProgressRef.current - progressRef.current) < 0.0015;
        if (resting) progressRef.current = targetProgressRef.current;
        else keepGoing = true;

        if (resting !== lastSettled) {
          lastSettled = resting;
          setSettled(resting);
        }

        clearTimeout(timer);
        timer = 0;
        const canAutoplay =
          resting && autoEnabled && visible && !document.hidden && !reducedMotion.matches && !paused;
        if (canAutoplay) {
          const intervalMs = Math.max(0.5, interval) * 1000;
          if (!armed) {
            armed = true;
            armedAt = Math.max(now, interactedAtRef.current + 3000 - intervalMs); // wait 3s after a touch
          }
          const due = armedAt + intervalMs;
          if (now >= due) {
            armed = false;
            report(null);
            targetProgressRef.current = Math.round(targetProgressRef.current) + dir;
            keepGoing = true;
          } else {
            report({ start: armedAt, end: due });
            timer = window.setTimeout(() => {
              timer = 0;
              start();
            }, due - now + 8);
          }
        } else {
          armed = false;
          if (autoEnabled) report(null);
        }
      }

      const front = modulo(Math.round(progressRef.current), count);
      if (front !== lastActive) {
        lastActive = front;
        setActive(front);
        callbacksRef.current.onActiveChange?.(front);
      }

      layout();
      if (keepGoing && visible && !frameId) frameId = requestAnimationFrame(render);
    };

    layout();
    start();
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
      wakeRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    count,
    stepMode,
    interval,
    glideSpeed,
    speed,
    direction,
    animationMode,
    radius,
    perspective,
    cardWidth,
    cardHeight,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    cardTilt,
    centerScale,
    edgeFade,
    edgeBlur,
    dim,
    pauseOnHover
  ]);

  /* ---------- front-card video (step mode) ---------- */
  const activeItem = normalizedItems[active];
  const wantVideo = stepMode && videos && !!activeItem?.video;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (settled) {
      video.muted = true;
      video.play().catch(() => {}); // blocked (Low Power Mode etc.) → the poster stays
    } else {
      video.pause();
    }
  }, [settled, active, wantVideo]);
  useEffect(() => setVideoShown(-1), [active]);

  /* ---------- interaction ---------- */
  const drag = useRef({ x: 0, y: 0, touch: false, samples: [] as { p: number; t: number }[] });

  const goTo = useCallback(
    (index: number) => {
      const half = count / 2;
      const offset = modulo(index - progressRef.current + half, count) - half;
      targetProgressRef.current = Math.round(progressRef.current + offset);
      interactedAtRef.current = performance.now();
      wakeRef.current();
    },
    [count]
  );

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default';
    if (stepMode) {
      // fling: carry a little momentum, then land on the nearest card
      const s = drag.current.samples;
      let velocity = 0;
      if (s.length > 1) {
        const a = s[0];
        const b = s[s.length - 1];
        velocity = (b.p - a.p) / Math.max((b.t - a.t) / 1000, 0.016);
      }
      targetProgressRef.current = Math.round(targetProgressRef.current + clamp(velocity * 0.18, -3, 3));
    }
    interactedAtRef.current = performance.now();
    wakeRef.current();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!stepMode) return;
    const next = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const prev = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!next && !prev) return;
    event.preventDefault();
    targetProgressRef.current = Math.round(targetProgressRef.current) + (next ? 1 : -1);
    interactedAtRef.current = performance.now();
    wakeRef.current();
  };

  const rootStyle = {
    perspective: `${perspective}px`,
    cursor: dragEnabled ? 'grab' : 'default',
    // touch: horizontal swipes drive the spiral, vertical swipes keep scrolling the page
    touchAction: dragEnabled ? 'pan-y' : 'auto',
    userSelect: dragEnabled ? 'none' : 'auto'
  } as CSSProperties;

  const cardStyle: CSSProperties = { width: cardWidth, height: cardHeight, borderRadius: cardRadius, top: `${centerY * 100}%` };
  const mediaStyle: CSSProperties = {
    objectFit: imageFit,
    filter: grayscale > 0 ? `grayscale(${Math.min(1, Math.max(0, grayscale))})` : undefined
  };

  return (
    <div
      ref={rootRef}
      className={`relative isolate h-full min-h-80 w-full overflow-hidden outline-none ${className}`}
      style={rootStyle}
      tabIndex={stepMode ? 0 : undefined}
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects spiral"
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        wakeRef.current();
      }}
      onPointerDown={event => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          touch: event.pointerType !== 'mouse',
          samples: [{ p: targetProgressRef.current, t: performance.now() }]
        };
        targetProgressRef.current = progressRef.current;
        interactedAtRef.current = performance.now();
        wakeRef.current();
      }}
      onPointerMove={event => {
        if (!draggingRef.current) return;
        const d = drag.current;
        const dx = event.clientX - d.x;
        const dy = event.clientY - d.y;
        d.x = event.clientX;
        d.y = event.clientY;
        // mouse: drag in any direction; touch: horizontal only (vertical = page scroll)
        const move = d.touch ? dx : dx + dy;
        if (!dragMovedRef.current && Math.abs(move) > 0.5) {
          dragMovedRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.style.cursor = 'grabbing';
        }
        targetProgressRef.current -= move / Math.max(verticalSpacing, 1);
        const now = performance.now();
        d.samples.push({ p: targetProgressRef.current, t: now });
        while (d.samples.length > 2 && now - d.samples[0].t > 120) d.samples.shift();
        wakeRef.current();
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClickCapture={event => {
        if (!dragMovedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        dragMovedRef.current = false;
      }}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]" role="list">
        {normalizedItems.map((item, index) => {
          const isFront = stepMode && index === active;
          const showVideo = isFront && wantVideo;
          const sources: InfiniteSpiralVideoSource[] =
            typeof item.video === 'string' ? [{ src: item.video }] : item.video ?? [];
          return (
            <div
              key={item.id ?? `${item.src}-${index}`}
              ref={node => {
                cardRefs.current[index] = node;
              }}
              data-active={isFront ? 'true' : undefined}
              className="absolute left-1/2 block cursor-pointer overflow-hidden border border-white/20 bg-white/5 shadow-[0_14px_38px_rgba(0,0,0,0.45)] transition-[border-color] duration-500 [backface-visibility:hidden] will-change-[transform,opacity] data-[active=true]:border-[#e84020]/70"
              style={cardStyle}
              role="listitem"
              aria-label={item.label ?? item.alt}
              aria-current={isFront ? 'true' : undefined}
              onClick={() => {
                if (!stepMode) {
                  if (item.href) window.open(item.href, item.target ?? '_self', 'noopener');
                  return;
                }
                if (index === active) callbacksRef.current.onSelect?.(index);
                else goTo(index);
              }}
            >
              <img
                className="absolute inset-0 block h-full w-full max-w-none select-none object-center"
                src={item.src}
                alt={item.alt}
                loading={index < 4 || index > count - 4 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                style={mediaStyle}
              />
              {dim > 0 && (
                <div
                  ref={node => {
                    dimRefs.current[index] = node;
                  }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[1] bg-black"
                  style={{ opacity: 0 }}
                />
              )}
              {showVideo && (
                <video
                  key={item.src}
                  ref={videoRef}
                  className={`absolute inset-0 block h-full w-full max-w-none object-center transition-opacity duration-500 ${
                    videoShown === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={mediaStyle}
                  poster={item.src}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  onPlaying={() => setVideoShown(index)}
                >
                  {sources.map(source => (
                    <source key={source.src} src={source.src} type={source.type} media={source.media} />
                  ))}
                </video>
              )}
            </div>
          );
        })}
      </div>
      <div className="sr-only" aria-live="polite">
        {stepMode && activeItem ? `${activeItem.label ?? activeItem.alt}, ${active + 1} of ${count}` : ''}
      </div>
    </div>
  );
};

export default InfiniteSpiral;