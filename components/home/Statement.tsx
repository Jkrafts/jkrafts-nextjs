"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * The practice's position statement. As it scrolls through the viewport the
 * words darken in reading order, which slows the eye down on the one
 * paragraph that explains what Jkrafts is for. The text is fully legible
 * without JavaScript and with reduced motion.
 */
export default function Statement({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      SplitText.create(el, {
        type: "words",
        autoSplit: true,
        onSplit(self) {
          return gsap.fromTo(
            self.words,
            { opacity: 0.22 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "bottom 50%",
                scrub: 0.6,
              },
            },
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className="t-statement">
      {children}
    </p>
  );
}
