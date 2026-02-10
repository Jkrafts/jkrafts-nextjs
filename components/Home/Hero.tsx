"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import Plasma from "@/components/Plasma";

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    if (!headlineRef.current) return;
    if (!scrollRef.current) return;

    const chars = headlineRef.current.textContent?.split("") || [];
    headlineRef.current.textContent = "";

    chars.forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      // span.style.display = "inline-block";
      headlineRef.current?.appendChild(span);
    });

    tl.fromTo(
      headlineRef.current.children,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.05,
      },
    ).to(
      scrollRef.current,
      {
        y: -20,
        opacity: 1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "expo.out",
      },
      "-=0.5",
    );
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-base">
      {/* Background Animated Plasma */}
      <Plasma
        color="#b19eef"
        speed={0.6}
        direction="pingpong"
        scale={1.2}
        opacity={0.8}
      />

      <div className="absolute inset-0 px-6 md:px-0">
        <div className="flex flex-col items-center justify-center h-full relative z-10">
          {/* Hero Content */}
          <h1
            ref={headlineRef}
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text text-center z-10"
          >
            Your Online Presence Redefined
          </h1>

          <p className="mt-4 lg:mt-8 text-lg md:text-2xl text-muted z-10 max-w-xl text-center">
            Let us craft digital solutions that speak volumes about your brand.
          </p>

          <svg
            ref={scrollRef}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            viewBox="-5.0 -10.0 110.0 135.0"
            className="absolute svg-base bottom-10 h-10 w-10"
          >
            <title>Scroll Down To Explore</title>
            <path
              d="m46.75 50.941c0.85547 0.875 2.0273 1.3711 3.25 1.3672 1.2188 0.011718 2.3945-0.46094 3.2695-1.3086l22.992-23c1.793-1.793 1.7969-4.6992 0.003906-6.4961-1.793-1.793-4.6992-1.7969-6.4961-0.003906l-19.77 19.719-19.738-19.688c-1.8164-1.6328-4.5859-1.5664-6.3203 0.15234-1.7305 1.7188-1.8203 4.4922-0.20312 6.3164zm23-1.8789-19.75 19.699-19.738-19.703c-1.7969-1.8008-4.7109-1.8047-6.5117-0.007813-1.8008 1.793-1.8047 4.707-0.011719 6.5078l23 22.922c1.8086 1.7852 4.7148 1.7852 6.5234 0l23-23c1.7852-1.793 1.7812-4.6953-0.011719-6.4805s-4.6914-1.7812-6.4805 0.011719z"
              fillRule="evenodd"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
