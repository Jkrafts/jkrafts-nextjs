'use client';

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface BlobProps {
  size?: number;
  top?: string;
  left?: string;
  opacity?: number;
  blur?: number;
  duration?: number;
}

export default function AnimatedBlob({
  size = 400,
  top = "0%",
  left = "50%",
  opacity = 0.3,
  blur = 150,
  duration = 12,
}: BlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!blobRef.current) return;

    const blob = blobRef.current;

    gsap.to(blob, {
      duration: duration,
      x: "+=60",
      y: "+=40",
      scale: 1.2,
      rotation: 15,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    gsap.to(blob, {
      duration: duration * 0.5,
      opacity: 0.25 + Math.random() * 0.15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [duration]);

  return (
    <div
      ref={blobRef}
      className="absolute rounded-full pointer-events-none z-10"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        top,
        left,
        opacity,
        filter: `blur(${blur}px)`,
        background: "linear-gradient(135deg, rgb(var(--gradient-start)), rgb(var(--gradient-middle)), rgb(var(--gradient-end)))",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
