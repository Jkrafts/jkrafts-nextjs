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
    // Visitors who ask for reduced motion get native scrolling: no easing
    // applied to their wheel/trackpad input.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: !prefersReducedMotion,
      orientation: 'vertical',
      infinite: false,
    });

    // In-page links ("#work", "#main"). Lenis' own `anchors` option scrolls
    // but lets the browser's native fragment navigation through, which pushes
    // a history entry with a null state. Next's App Router ignores popstate
    // into such entries, so going Back into one (e.g. closing a story entered
    // from the home page) changed the URL without changing the page. Instead:
    // scroll with Lenis, record the hash through history.pushState (which
    // Next patches to carry its router state), and move focus to the target
    // as native fragment navigation would.
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]');
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
      const target = url.hash.length > 1 ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      if (!target) return;

      e.preventDefault();
      if (location.hash !== url.hash) window.history.pushState(null, '', url.hash);
      lenisInstance.scrollTo(target, { offset: -72, immediate: prefersReducedMotion });
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onAnchorClick);

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
      document.removeEventListener('click', onAnchorClick);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={{ lenis }}>{children}</LenisContext.Provider>;
};
