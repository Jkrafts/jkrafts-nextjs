'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLenis } from '@/providers/LenisProvider';
import { completePageTransition, startPageTransition } from '@/lib/pageTransition';

/**
 * Runs the page transition (lib/pageTransition.ts) for internal links.
 *
 * Clicks are claimed in the capture phase, before next/link sees them
 * (Link skips navigation when the event is already default-prevented), so
 * the curtain can cover the page first and the route changes underneath.
 *
 * Left alone:
 * - new-tab/window clicks, downloads and external links;
 * - links to the page already showing (hash and query changes stay with the
 *   page, e.g. Lenis' in-page anchors);
 * - work-index rows (`data-story`), which run their own transition, and
 *   anything marked `data-no-page-transition`;
 * - back/forward: the browser restores scroll there, and a curtain fighting
 *   it looks broken. Those navigations get the page's own intro only.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const routerRef = useRef(router);
  const lenisRef = useRef(lenis);

  useEffect(() => {
    routerRef.current = router;
    lenisRef.current = lenis;
  }, [router, lenis]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      if (link.closest('[data-story], [data-no-page-transition]')) return;

      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      const href = url.pathname + url.search + url.hash;
      e.preventDefault();
      // Start loading now, so it overlaps the cover instead of following it
      // (links that were never visible, e.g. in the closed mobile menu,
      // haven't been prefetched).
      routerRef.current.prefetch(href);
      // The curtain's wave starts under the pointer (centre for keyboard).
      const originX = e.detail === 0 ? null : e.clientX;
      startPageTransition(href, () => routerRef.current.push(href), originX);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // The new route has rendered (this runs after the page's own effects).
  useEffect(() => {
    completePageTransition(() => {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    });
  }, [pathname]);

  return null;
}
