'use client';

import Lenis from "lenis";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLayoutEffect, useRef } from "react";

const ScrollFlipCards: React.FC = () => {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const stickyHeader = useRef<HTMLHeadingElement | null>(null);

  // Animation state flags
  const isGapAnimationCompleted = useRef<boolean>(false);
  const isFlipAnimationCompleted = useRef<boolean>(false);

  useLayoutEffect(() => {
    const lenis = new Lenis();

    const updateScroll = () => ScrollTrigger.update();
    lenis.on("scroll", updateScroll);

    const tickerFn = (time: number): void => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Ensure no leftover triggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    // Bail if refs not ready
    if (!containerRef.current || !cardRef.current || !stickyHeader.current) {
      return;
    }

    const mm = gsap.matchMedia();

    /** ---------------------------------------------------------
     * 🟦 MOBILE RESET (max-width: 1024px)
     * --------------------------------------------------------- */
    mm.add("(max-width: 1024px)", () => {
      const container = containerRef.current;
      if (!container) return;

      const resetEls = container.querySelectorAll<HTMLElement>(
        ".scroll-flip .scroll-flip-card, .sticky-header h2"
      );

      resetEls.forEach((el) => {
        el.style.cssText = "";
      });
    });

    /** ---------------------------------------------------------
     * 🟩 DESKTOP ANIMATIONS (min-width: 1025px)
     * --------------------------------------------------------- */
    mm.add("(min-width: 1025px)", () => {
      const container = containerRef.current;
      const cardContainer = cardRef.current;
      const header = stickyHeader.current;

      if (!container || !cardContainer || !header) return;

      const cards = cardContainer.querySelectorAll<HTMLElement>(
        ".scroll-flip-card"
      );

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${container.offsetHeight}px`,
        pin: true,
        scrub: true,
        pinSpacing: true,

        onUpdate: (self: ScrollTrigger) => {
          const progress: number = self.progress;

          /** -------------------------------------------------
           * HEADER FADE + SLIDE
           * ------------------------------------------------- */
          if (progress >= 0.1 && progress <= 0.25) {
            const headerProgress = gsap.utils.mapRange(
              0.1,
              0.25,
              0,
              1,
              progress
            );
            gsap.set(header, {
              y: gsap.utils.mapRange(0, 1, 40, 0, headerProgress),
              opacity: gsap.utils.mapRange(0, 1, 0, 1, headerProgress),
            });
          } else if (progress < 0.1) {
            gsap.set(header, { y: 40, opacity: 0 });
          } else if (progress > 0.25) {
            gsap.set(header, { y: 0, opacity: 1 });
          }

          /** -------------------------------------------------
           * GAP OPENING
           * ------------------------------------------------- */
          if (progress >= 0.35 && !isGapAnimationCompleted.current) {
            gsap.to(cardContainer, {
              gap: "20px",
              duration: 0.5,
              ease: "power2.out",
            });

            gsap.to(cards, {
              borderRadius: "20px",
              duration: 0.5,
              ease: "power3.out",
            });

            isGapAnimationCompleted.current = true;
          }

          /** -------------------------------------------------
           * GAP CLOSING (REVERSE)
           * ------------------------------------------------- */
          else if (progress < 0.35 && isGapAnimationCompleted.current) {
            gsap.to(cardContainer, {
              gap: "0px",
              duration: 0.5,
              ease: "power3.out",
            });

            gsap.to("#flip-card-1", {
              borderRadius: "20px 0 0 20px",
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to("#flip-card-2", {
              borderRadius: "0px",
              duration: 0.5,
              ease: "power3.out",
            });
            gsap.to("#flip-card-3", {
              borderRadius: "0 20px 20px 0",
              duration: 0.5,
              ease: "power3.out",
            });

            isGapAnimationCompleted.current = false;
          }

          /** -------------------------------------------------
           * CARD FLIP FORWARD
           * ------------------------------------------------- */
          if (progress >= 0.7 && !isFlipAnimationCompleted.current) {
            gsap.to(cards, {
              rotationY: 180,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: 0.1,
            });

            gsap.to(["#flip-card-1", "#flip-card-3"], {
              y: 30,
              rotationZ: (i: number): number => [-15, 15][i],
              duration: 0.75,
              ease: "power3.inOut",
            });

            isFlipAnimationCompleted.current = true;
          }

          /** -------------------------------------------------
           * CARD FLIP REVERSE
           * ------------------------------------------------- */
          else if (progress < 0.7 && isFlipAnimationCompleted.current) {
            gsap.to(cards, {
              rotationY: 0,
              duration: 0.75,
              ease: "power3.inOut",
              stagger: -0.1,
            });

            gsap.to(["#flip-card-1", "#flip-card-3"], {
              y: 0,
              rotationZ: 0,
              duration: 0.75,
              ease: "power3.inOut",
            });

            isFlipAnimationCompleted.current = false;
          }
        },
      });
    });

    /** ---------------------------------------------------------
     * CLEANUP
     * --------------------------------------------------------- */
    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      mm.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="scroll-flip">
      <div className="sticky-header">
        <h2
          ref={stickyHeader}
          className="relative text-center will-change-[transform,opacity] transform translate-y-10 opacity-100 lg:opacity-0"
        >
          Three Core Pillars With a Unified Goal
        </h2>
      </div>

      <div ref={cardRef} className="scroll-flip-cards-container">
        {/* CARD 1 */}
        <div className="scroll-flip-card" id="flip-card-1">
          <div className="scroll-flip-card-front">
            <Image src="/50.png" alt="Innovation" width={300} height={200} />
          </div>
          <div className="scroll-flip-card-back">
            <span>( 1 )</span>
            <p>We prioritize exceptional craftsmanship in every product.</p>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="scroll-flip-card" id="flip-card-2">
          <div className="scroll-flip-card-front">
            <Image src="/50.png" alt="Quality" width={300} height={200} />
          </div>
          <div className="scroll-flip-card-back">
            <span>( 2 )</span>
            <p>Every component is designed for reliability and longevity.</p>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="scroll-flip-card" id="flip-card-3">
          <div className="scroll-flip-card-front">
            <Image src="/50.png" alt="Design" width={300} height={200} />
          </div>
          <div className="scroll-flip-card-back">
            <span>( 3 )</span>
            <p>We blend innovation and beauty to deliver stunning results.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollFlipCards;
