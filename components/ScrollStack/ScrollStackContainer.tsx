'use client';

import useForceRerender from '@/hooks/useForceRerender';
import { useState, useRef, useLayoutEffect } from 'react';
import ScrollStack, { ScrollStackItem }  from './index';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { projects } from '@/data/projects';
import CursorLink from '../TargetCursor/CursorLink';

export const ScrollStackContainer = () => {

  const [key, forceRerender] = useForceRerender();
  const [itemDistance, setItemDistance] = useState(100);
  const [itemStackDistance, setItemStackDistance] = useState(30);
  const [baseScale, setBaseScale] = useState(0.85);
  const [rotationAmount, setRotationAmount] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const [stackPosition, setStackPosition] = useState('35%');
  const [scaleEndPosition, setscaleEndPosition] = useState('10%');

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const isStackAnimationCompleted = useRef(false);
  const stackMetricsRef = useRef<{ start: number; end: number } | null>(null);


  useLayoutEffect(() => {
    
    const ctx = gsap.context(() => {
      if (!containerRef.current || !headerRef.current) return;

      const mm = gsap.matchMedia();
      
      mm.add("(max-width: 1024px)", () => {
        const container = containerRef.current!;
        const resetEls = container.querySelectorAll<HTMLElement>(
          ".scroll-flip .scroll-flip-card, .sticky-header h2"
        );

        resetEls.forEach((el) => el.style.cssText = "");
      });

      mm.add("(min-width: 1025px)", () => {
        const container = containerRef.current!;
        const header = headerRef.current!;

        const scrollFlipEndOffset = container.offsetTop + container.offsetHeight;

        // -----------------------------------
        // Header ScrollTrigger
        // -----------------------------------
        ScrollTrigger.create({
          start: () => stackMetricsRef.current!.start,
          end: () => stackMetricsRef.current!.end,
          trigger: header,
          pin: true,
          scrub: false,
          pinSpacing: false,
          anticipatePin: 1,
          markers: false,
          invalidateOnRefresh: true,
          refreshPriority: 1,

          onUpdate: (self) => {
            const progress = self.progress;

            if (progress === 1 && !isStackAnimationCompleted.current) {
              isStackAnimationCompleted.current = true;
            }
          },
          onRefresh(self) {
            // console.log({
            //   start: self.start,
            //   scroll: self.scroll()
            // });
          }
      });

      }, headerRef);
    });
          
  }, [key]);

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">

      <h2 ref={headerRef} id='featured-projects-header' className='pt-16 font-instrument max-w-[1200px] padded-fit text-center text-3xl md:text-4xl lg:text-6xl'>
        Featured Projects
      </h2>

      <ScrollStack
        // key={key}
        itemDistance={itemDistance}
        itemStackDistance={itemStackDistance}
        stackPosition={stackPosition}
        baseScale={baseScale}
        scaleEndPosition={scaleEndPosition}
        rotationAmount={rotationAmount}
        blurAmount={blurAmount}
        useWindowScroll={true}
        onStackMetrics={(metrics) => {
          stackMetricsRef.current = metrics;
          // console.log({metrics})
          ScrollTrigger.refresh();
        }}
        onStackComplete={() => {
          isStackAnimationCompleted.current = true;
        }}
      >

        {projects.slice(0, 3).map((project, index) => (
          <ScrollStackItem 
            key={index}
            itemClassName={`shadow-lg`}
            style={{'--scroll-stack-card-background': project.accentColor} as React.CSSProperties}
          >
            <h2 className="text-2xl font-bold mb-2 text-white">{project.title}</h2>
            <p className="text-gray-300 dark:text-gray-300">{project.shortTagline}</p>
            <div className='text-white'>
              <h3 className="mt-4 font-semibold text-white">Skills:</h3>
              <ul className="flex list-none gap-2 flex-wrap">
                {project.skills.map((skill, skillIndex) => {

                  return(
                    <>
                      <li key={skillIndex}>{skill}
                        {skillIndex !== project.skills.length - 1 ?',' : ''}
                      </li>
                    </>
                  )
                })}
              </ul>
            </div>
          </ScrollStackItem>
        ))}

      </ScrollStack>

      <div className='flex flex-col'>
        <CursorLink href="/projects" className='cta'>
          View full project list...
        </CursorLink>
      </div>
    </div>
  )
}
