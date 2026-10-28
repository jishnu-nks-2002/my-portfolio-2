"use client";

import { useEffect, useState } from "react";
import Lanyard from "./Lanyard";

/**
 * Your photo turned into a developer ID badge on the 3D lanyard.
 * The card front, back and strap are drawn on canvases in the browser, so you only
 * need to supply the photo — name, role and contact details are printed on the card.
 */

interface LanyardBadgeProps {
  photo: string;
  name: string;
  role: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  /** Card height as a share of the box height (0.15–0.9). */
  size?: number;
  /** 0 = short strap (card near the top), 1 = long strap. */
  strapLength?: number;
  className?: string;
}

interface Faces {
  front: string;
  back: string;
  strap: string;
}

// card is 1.6 × 2.25 in the Lanyard scene → same proportions here
const W = 1024;
const H = 1440;
const RED = "#dc2626";
const INK = "#0b0b0b";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const rounded = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

/** object-cover, biased toward the top so faces stay in frame */
const drawCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * 0.25, dw, dh);
};

/** largest font size (≤ max) at which text fits the width */
const fit = (ctx: CanvasRenderingContext2D, text: string, weight: string, family: string, max: number, width: number) => {
  let size = max;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 2;
  } while (ctx.measureText(text).width > width && size > 12);
  return ctx.font;
};

export async function buildFaces(p: LanyardBadgeProps): Promise<Faces> {
  await document.fonts?.ready;
  // Use the site's Geist font (next/font puts it on <html> as --font-geist-sans); never fall back to serif.
  const geist = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim();
  const sans = `${geist ? geist + ", " : ""}ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const photo = await loadImage(p.photo);

  /* ---------- front ---------- */
  const front = document.createElement("canvas");
  front.width = W;
  front.height = H;
  const f = front.getContext("2d")!;
  f.fillStyle = INK;
  f.fillRect(0, 0, W, H);

  // header (kept below the strap slot that's cut into the top of the card)
  f.textBaseline = "middle";
  f.fillStyle = "#ffffff";
  f.font = `800 60px ${sans}`;
  f.fillText("JU", 64, 156);
  const ju = f.measureText("JU").width;
  f.fillStyle = RED;
  f.beginPath();
  f.arc(64 + ju + 16, 174, 10, 0, Math.PI * 2);
  f.fill();
  f.fillStyle = "rgba(255,255,255,0.55)";
  f.font = `600 26px ${mono}`;
  f.textAlign = "right";
  f.fillText("DEVELOPER ID", W - 64, 156);
  f.textAlign = "left";

  // photo
  const px = 64, py = 220, pw = W - 128, ph = 800;
  f.save();
  rounded(f, px, py, pw, ph, 36);
  f.clip();
  f.fillStyle = "#1a1a1a";
  f.fillRect(px, py, pw, ph);
  if (photo) drawCover(f, photo, px, py, pw, ph);
  const shade = f.createLinearGradient(0, py + ph * 0.6, 0, py + ph);
  shade.addColorStop(0, "rgba(11,11,11,0)");
  shade.addColorStop(1, "rgba(11,11,11,0.55)");
  f.fillStyle = shade;
  f.fillRect(px, py, pw, ph);
  f.restore();
  // red corner tag on the photo
  f.fillStyle = RED;
  rounded(f, px + 28, py + ph - 76, 200, 48, 24);
  f.fill();
  f.fillStyle = "#ffffff";
  f.font = `700 24px ${mono}`;
  f.textAlign = "center";
  f.fillText("● AVAILABLE", px + 128, py + ph - 52);
  f.textAlign = "left";

  // name + role
  f.fillStyle = "#ffffff";
  f.font = fit(f, p.name, "800", sans, 92, W - 128);
  f.fillText(p.name, 64, 1110);
  f.fillStyle = RED;
  f.font = fit(f, p.role.toUpperCase(), "700", mono, 36, W - 128);
  f.fillText(p.role.toUpperCase(), 64, 1180);

  f.fillStyle = "rgba(255,255,255,0.12)";
  f.fillRect(64, 1232, W - 128, 2);

  f.fillStyle = "rgba(255,255,255,0.65)";
  f.font = `500 30px ${sans}`;
  f.fillText(p.title, 64, 1290);
  f.fillText(p.location, 64, 1338);

  // barcode
  let bx = W - 64 - 250;
  const seed = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3];
  seed.forEach((w, i) => {
    f.fillStyle = i % 5 === 2 ? RED : "#ffffff";
    f.fillRect(bx, 1268, w * 4, 88);
    bx += w * 4 + 5;
  });

  f.fillStyle = RED;
  f.fillRect(0, H - 34, W, 34);

  /* ---------- back ---------- */
  const back = document.createElement("canvas");
  back.width = W;
  back.height = H;
  const b = back.getContext("2d")!;
  b.fillStyle = RED;
  b.fillRect(0, 0, W, H);
  b.textAlign = "center";
  b.textBaseline = "middle";

  // big "JU." — the dot sits on the text baseline, just after the U
  const baseline = 740;
  const dotR = 42;
  b.font = `900 380px ${sans}`;
  const big = b.measureText("JU").width;
  const cx = W / 2 - (dotR + 18) / 2; // centre "JU" + dot as one group
  b.textBaseline = "alphabetic";
  b.fillStyle = "#ffffff";
  b.fillText("JU", cx, baseline);
  b.fillStyle = INK;
  b.beginPath();
  b.arc(cx + big / 2 + 18 + dotR, baseline - dotR, dotR, 0, Math.PI * 2);
  b.fill();
  b.textBaseline = "middle";

  b.fillStyle = "#ffffff";
  b.font = `700 46px ${sans}`;
  b.fillText("Let's build something", W / 2, 880);
  b.fillText("great together.", W / 2, 940);

  b.fillStyle = "rgba(255,255,255,0.85)";
  b.font = fit(b, p.email, "500", sans, 34, W - 160);
  b.fillText(p.email, W / 2, 1110);
  b.font = `500 34px ${sans}`;
  b.fillText(p.phone, W / 2, 1166);
  b.fillText(p.location, W / 2, 1222);

  b.fillStyle = "rgba(255,255,255,0.6)";
  b.font = `600 24px ${mono}`;
  b.fillText(`PORTFOLIO · ${new Date().getFullYear()}`, W / 2, H - 90);

  /* ---------- strap (one seamless repeat of the text) ---------- */
  const unit = `${p.name.toUpperCase()}  ✦  ${p.role.toUpperCase()}  ✦  `;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `800 84px ${sans}`;
  const strap = document.createElement("canvas");
  strap.width = Math.ceil(measure.measureText(unit).width);
  strap.height = 192;
  const s = strap.getContext("2d")!;
  s.fillStyle = INK;
  s.fillRect(0, 0, strap.width, strap.height);
  s.font = `800 84px ${sans}`;
  s.textBaseline = "middle";
  let x = 0;
  unit.split(/(✦)/).forEach((part) => {
    s.fillStyle = part === "✦" ? RED : "#ffffff";
    s.fillText(part, x, 100);
    x += s.measureText(part).width;
  });

  return {
    front: front.toDataURL("image/jpeg", 0.9),
    back: back.toDataURL("image/jpeg", 0.9),
    strap: strap.toDataURL("image/png"),
  };
}

export default function LanyardBadge(props: LanyardBadgeProps) {
  const [faces, setFaces] = useState<Faces | null>(null);
  const { photo, name, role, title, email, phone, location } = props;

  useEffect(() => {
    let alive = true;
    buildFaces({ photo, name, role, title, email, phone, location }).then((result) => {
      if (alive) setFaces(result);
    });
    return () => {
      alive = false;
    };
  }, [photo, name, role, title, email, phone, location]);

  if (!faces) return null;

  return (
    <Lanyard
      frontImage={faces.front}
      backImage={faces.back}
      strapImage={faces.strap}
      strapColor={INK}
      cardColor={INK}
      orientation="portrait"
      finish="glossy"
      cornerRadius={0.35}
      size={props.size ?? 0.62}
      anchor="center"
      strapLength={props.strapLength ?? 0.42}
      strapWidth={0.7}
      metal="silver"
      gravity={1}
      damping={0.5}
      elasticity={0.5}
      breeze={0.35}
      interactive
      intro
      className={props.className}
    />
  );
}