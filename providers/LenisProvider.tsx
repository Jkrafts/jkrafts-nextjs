'use client';

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from '@/lib/gsap';
import 'lenis/dist/lenis.css'

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export const useLenis = () => useContext(LenisContext).lenis;

export const LenisProvider = ({ children }: { children: ReactNode }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      orientation: 'vertical',
      infinite: false,
    });

    // Set lenis instance in state
    Promise.resolve().then(() => setLenis(lenisInstance));

    // -------------------------------
    // ScrollTrigger scrollerProxy
    // -------------------------------
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenisInstance.scrollTo(value, { duration: 0 });
        }
        return lenisInstance.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();

    // -------------------------------
    // RAF loop
    // -------------------------------
    const raf = (time: number) => {
      lenisInstance.raf(time);
      ScrollTrigger.update(); // keep pinned sections and animations in sync
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={{ lenis }}>{children}</LenisContext.Provider>;
};
