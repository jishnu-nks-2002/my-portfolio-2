import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AnimatedFavicon from "@/component/AnimatedFavicon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Static tab icons come from app/favicon.ico, app/icon.svg and app/apple-icon.png
// (Next.js picks them up automatically); <AnimatedFavicon /> animates on top of them.
export const metadata: Metadata = {
  title: "Jishnu Narayanan | MERN Stack Developer",
  description:
    "Junior Software Engineer specializing in building full-stack web applications with React, Next.js, Node.js and MongoDB, and crafting custom Shopify and WordPress sites — from secure admin panels and Razorpay payments to smooth GSAP animations, for clients in India, the UAE and Northern Europe.",
};

// colours the mobile browser bar to match the site
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* pulsing red-dot tab icon + "come back" title when the tab is in the background */}
        <AnimatedFavicon />
        {children}
      </body>
    </html>
  );
}