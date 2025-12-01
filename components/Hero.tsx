'use client';

import AnimatedBlob from "./AnimatedBlob";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;

    const chars = headlineRef.current.textContent?.split("") || [];
    headlineRef.current.textContent = "";

    chars.forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      headlineRef.current?.appendChild(span);
    });

    gsap.fromTo(
      headlineRef.current.children,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.05,
      }
    );
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center px-6 md:px-12 bg-pf-surface">
      {/* Blobs */}
      <AnimatedBlob size={500} top="20%" left="20%" opacity={0.73} blur={200} duration={15} />
      <AnimatedBlob size={600} top="50%" left="70%" opacity={0.75} blur={250} duration={18} />
      <AnimatedBlob size={400} top="80%" left="40%" opacity={0.75} blur={180} duration={12} />

      {/* Hero Content */}
      <h1
        ref={headlineRef}
        className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text z-10"
      >
        Joe Waithaka
      </h1>
      <p className="mt-4 text-lg md:text-2xl text-muted z-10 max-w-xl">
        Fullstack Developer | Next.js & Nuxt.js | Creative, Performance-First Web Experiences
      </p>
      <a
        href="#projects"
        className="mt-8 inline-block btn-primary z-10"
      >
        Explore My Work
      </a>
    </section>
  );
}
