"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { steps } from "@/data/home";

/**
 * The four steps of a project. A violet rule fills along the steps as the
 * section scrolls through, marking how far along the journey the reader is.
 * Without JavaScript or with reduced motion the rule is simply full.
 */
export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fill = root.querySelector<HTMLElement>("[data-steps-fill]");
    const list = root.querySelector<HTMLElement>("[data-steps]");
    if (!fill || !list) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="how-it-works" aria-labelledby="how-title" className="shell pb-[var(--section)]">
      <div className="border-t border-line-strong pt-10 md:pt-14">
        <h2 id="how-title" className="t-h2">
          How it works
        </h2>
        <p className="mt-6 max-w-[42ch] text-muted">
          Four steps from first call to launch, with the scope, price and launch date agreed before
          any work starts.
        </p>
      </div>

      <div className="relative mt-12 md:mt-16">
        <div aria-hidden="true" className="steps-track">
          <span data-steps-fill className="steps-fill" />
        </div>
        <ol data-steps className="grid gap-y-10 pt-8 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="t-small tabular-nums text-muted" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="t-h3 mt-3 max-w-[14ch]">{s.title}</h3>
              <p className="mt-3 max-w-[34ch] text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
