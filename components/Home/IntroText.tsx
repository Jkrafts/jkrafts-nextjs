'use client';

import { gsap } from "@/lib/gsap";
import { useRef, useEffect } from "react";

export const IntroText = () => {

  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!text1Ref.current) return;
    if (!text2Ref.current) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#intro-text-section",
      start: "top 80%",
      end: "center center",
      scrub: true,
      pin: false,
      once: true,
    }
  });

  tl.fromTo(text1Ref.current, {
      xPercent: -100,
      opacity: 0,
  }, {
      xPercent: 0,
      opacity: 1,
  }).fromTo(text2Ref.current, {
      xPercent: 100,
      opacity: 0,
  },{
      xPercent: 0,
      opacity: 1,
  }, "-=0.5");

  },[]);
  

  return (
    <div id="intro-text-section" className="overflow-hidden py-10 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 h-svh flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row gap-y-4 md:gap-x-6 justify-center items-center mb-12">
          <h2 ref={text1Ref} className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">
            Custom Crafted
          </h2>
          
          <span className="text-3xl md:text-4xl lg:text-6xl">&bull;</span>
          
          <h2 className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">
            Strategic
          </h2>
          
          <span className="text-3xl md:text-4xl lg:text-6xl">&bull;</span>

          <h2 ref={text2Ref} className="font-instrument font-medium text-center text-3xl md:text-4xl lg:text-6xl">
            Built to scale
          </h2>
        </div>

        <div>
          <p className="text-lg md:text-2xl text-center max-w-4xl font-manrope">
            At Jkrafts, we design and develop digital experiences that don’t just look good — they solve real business problems. 
            From sleek websites to robust web applications, everything we build is intentional, performant, and future-ready.
          </p>
        </div>
      </div>
  )
}
