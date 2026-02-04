'use client';

import { useRef, useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import CursorLink from "../TargetCursor/CursorLink";

const BioTeaser = () => {

  const headerRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const paragraph = paragraphRef.current;
  
    if(!header || !paragraph) return;

    const text = SplitText.create(paragraph, { type: "lines, words,chars" });

    gsap.set(paragraph, { perspective: 400 });
  
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: "top 90%",
        end: "bottom 20%",
        scrub: false,
        pin: false,
        markers: false
      }
    })

    tl.fromTo(header,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 2, ease: "power3.out" }
    ).fromTo(text.words,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.03 },
      "-=1.5"
    );

    // Cleanup function to kill the ScrollTrigger
    return () => {
      tl.kill();
    };

  }, []);

  return (
    <div id="bio-tease" className="overflow-hidden py-10 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 h-svh flex flex-col items-center justify-center gap-y-12">
      <h2 ref={headerRef} className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">The Mind behind Jkrafts</h2>

      <div className="flex flex-col space-y-10 md:space-y-12">
        <p ref={paragraphRef} className="text-lg md:text-2xl text-center max-w-4xl font-manrope">
          I'm a web developer focused on crafting reliable, scalable, and thoughtful digital solutions. I work closely with clients to understand their goals and translate them into systems that support real growth.
        </p>

        <CursorLink href="/about" className="block mx-auto font-manrope text-lg md:text-xl bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition duration-300">Learn More About Jkrafts</CursorLink>
      </div>
    </div>
  )
}

export default BioTeaser;