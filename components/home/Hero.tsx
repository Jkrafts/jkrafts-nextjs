"use client";

import { useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, SplitText } from "@/lib/gsap";
import { isPageTransitionActive } from "@/lib/pageTransition";
import CursorLink from "@/components/TargetCursor/CursorLink";

// WebGL is purely decorative here: load it after the text, client-side only.
const Plasma = dynamic(() => import("@/components/Plasma"), { ssr: false });

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const title = root.querySelector<HTMLElement>("[data-hero-title]");
    const rule = root.querySelector<HTMLElement>("[data-hero-rule]");
    const rest = root.querySelectorAll<HTMLElement>("[data-hero-rest]");
    if (!title || !rule) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([title, rule, ...rest], { opacity: 1 });
        return;
      }

      // Arriving through the page transition: the curtain hands the headline
      // over already in place, so it must be showing, unsplit, right away.
      // The rule and supporting copy follow once the curtain has lifted.
      if (isPageTransitionActive()) {
        gsap.set(title, { opacity: 1 });
        gsap
          .timeline({ delay: 0.7 })
          .fromTo(
            rule,
            { scaleX: 0, opacity: 1, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.1, ease: "power3.inOut" },
          )
          .fromTo(
            rest,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" },
            0.3,
          );
        return;
      }

      // The single orchestrated moment on the site: headline lines rise out
      // of their own masks, the rule draws across, then the supporting copy
      // settles in. autoSplit re-splits once the web font has loaded (or the
      // viewport resizes) so line breaks are always correct.
      SplitText.create(title, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "hero-line",
        onSplit(self) {
          gsap.set(title, { opacity: 1 });
          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
          tl.from(self.lines, { yPercent: 105, duration: 1.3, stagger: 0.09 })
            .fromTo(
              rule,
              { scaleX: 0, opacity: 1, transformOrigin: "left center" },
              { scaleX: 1, duration: 1.2, ease: "power3.inOut" },
              0.35,
            )
            .fromTo(
              rest,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" },
              0.7,
            );
          return tl;
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Plasma color="#b19eef" speed={0.6} direction="pingpong" scale={1.2} opacity={0.85} />
      </div>
      {/* Keeps the copy legible where it overlaps the shader and blends the
          hero into the page below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-paper via-paper/70 to-transparent"
      />

      <div className="shell pt-[calc(var(--header-h)+3rem)] pb-[clamp(2rem,5vw,3.5rem)]">
        <h1 id="hero-title" data-intro data-hero-title className="t-display">
          <span className="block">Websites &amp; systems,</span>
          <span className="block">crafted to last.</span>
        </h1>

        <div className="mt-[clamp(2rem,5vw,4rem)]">
          <div data-intro data-hero-rule className="h-px bg-line-strong" />
          <div className="grid-12 gap-y-8 pt-6">
            <p data-intro data-hero-rest className="t-lead col-span-4 max-w-[34ch] md:col-span-6">
              Jkrafts designs and builds websites, web apps and business systems that look sharp and
              solve real problems.
            </p>
            <div
              data-intro
              data-hero-rest
              className="col-span-4 flex flex-col gap-5 md:col-span-6 md:items-end lg:col-span-5 lg:col-start-8"
            >
              <div className="flex flex-wrap gap-3">
                <a href="#work" className="btn btn-primary cursor-target">
                  See selected work
                </a>
                <CursorLink href="/contact" className="btn btn-outline">
                  Start a project
                </CursorLink>
              </div>
              <p className="t-small flex items-center gap-2.5 text-muted">
                <span className="mark" aria-hidden="true" />
                Available for new projects and long-term work
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
