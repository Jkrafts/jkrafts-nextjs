'use client';

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const skills = ["Next.js", "Nuxt.js", "React", "Vue", "GSAP", "Tailwind CSS", "WebGL"];

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aboutRef.current) return;

    gsap.from(aboutRef.current.children, {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: aboutRef.current,
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section className="bg-background py-20 px-6 md:px-12">
      <div ref={aboutRef} className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-heading text-text mb-6">
          About Me
        </h2>
        <p className="text-muted font-body mb-8">
          I am a fullstack developer specializing in Next.js and Nuxt.js. I
          craft immersive, animation-driven websites with performance and
          user experience in mind.
        </p>

        <h3 className="text-2xl font-heading text-text mb-4">Skills</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg bg-surface text-text text-sm font-body shadow-md"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
