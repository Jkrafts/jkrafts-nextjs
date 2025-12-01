'use client';

import { useEffect, useRef } from "react";
import { gsap } from "gsap";


interface Project {
  title: string;
  description: string;
  link: string;
}

const projects: Project[] = [
  {
    title: "Next.js Portfolio",
    description: "My performance-first, Awwwards-inspired portfolio.",
    link: "#",
  },
  {
    title: "Nuxt.js Sandbox",
    description: "Experimenting with Vue & GSAP kinetic UI components.",
    link: "#",
  },
  {
    title: "WebGL Experiments",
    description: "Interactive 3D graphics & shaders with Three.js.",
    link: "#",
  },
];

export default function Projects() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    gsap.from(gridRef.current.children, {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 80%",
      },
    });
  }, []);

  return (
    <section id="projects" className="relative bg-background py-20 px-6 md:px-12">
      <h2 className="text-3xl md:text-4xl font-heading text-text mb-12 text-center">
        My Work
      </h2>

      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {projects.map((project, idx) => (
          <a
            key={idx}
            href={project.link}
            className="card group transform transition-transform duration-300 hover:scale-105"
          >
            <h3 className="text-xl font-heading text-text group-hover:text-primary mb-2">
              {project.title}
            </h3>
            <p className="text-muted font-body">{project.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
