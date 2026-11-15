'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useLenis } from '@/providers/LenisProvider';
import { isPageTransitionActive } from '@/lib/pageTransition';
import CursorLink from '@/components/TargetCursor/CursorLink';
import ThemeToggle from '@/components/DarkModeToggle';
import Icon from '@/components/Icon';
import { contact, navItems, socials } from '@/lib/site';
import './Navbar.css';

const isCurrent = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

export default function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openRef = useRef(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Solid header background once the page has scrolled past the very top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Open/close timeline for the mobile menu panel. Built once and played
  // forwards/backwards, so rapid toggling can never desync from state.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const layersEl = layersRef.current;
    if (!panel || !layersEl) return;

    const ctx = gsap.context(() => {
      const layers = Array.from(layersEl.children) as HTMLElement[];
      const labels = panel.querySelectorAll<HTMLElement>('.menu-item-label');
      const footer = panel.querySelectorAll<HTMLElement>('.menu-footer > *');

      gsap.set([...layers, panel], { xPercent: 100 });

      const tl = gsap.timeline({ paused: true });
      // Reversing the timeline restores `hidden` once fully closed.
      tl.set([...layers, panel], { visibility: 'visible' }, 0)
        .to(layers, { xPercent: 0, duration: 0.5, ease: 'power4.out', stagger: 0.07 }, 0)
        .to(panel, { xPercent: 0, duration: 0.6, ease: 'power4.out' }, 0.12)
        .fromTo(labels, { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.07 }, 0.25)
        .fromTo(
          footer,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.06 },
          0.45,
        );

      tlRef.current = tl;
    });

    return () => {
      tlRef.current = null;
      ctx.revert();
    };
  }, []);

  const animate = useCallback((to: boolean) => {
    const tl = tlRef.current;
    if (!tl) return;
    // Instant under reduced motion, and when closing behind the page
    // transition's curtain (an animated close would outlast the curtain and
    // slide across the new page).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || (!to && isPageTransitionActive())) {
      tl.progress(to ? 1 : 0).pause();
      return;
    }
    if (to) tl.timeScale(1).play();
    else tl.timeScale(2.2).reverse(); // close faster than it opens
  }, []);

  const setMenu = useCallback(
    (to: boolean, { restoreFocus = true } = {}) => {
      if (openRef.current === to) return;
      openRef.current = to;
      setOpen(to);
      animate(to);
      if (to) {
        lenis?.stop();
        requestAnimationFrame(() => {
          panelRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
        });
      } else {
        lenis?.start();
        if (restoreFocus) toggleRef.current?.focus({ preventScroll: true });
      }
    },
    [animate, lenis],
  );

  // Close after client-side navigation (the header lives in a persistent
  // layout, so it is never unmounted by route changes).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setMenu(false, { restoreFocus: false });
  }, [pathname, setMenu]);

  // Escape closes; growing past the mobile breakpoint closes too.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => {
      if (mq.matches) setMenu(false, { restoreFocus: false });
    };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open, setMenu]);

  // Never leave scrolling locked if the header unmounts while open.
  useEffect(() => () => lenis?.start(), [lenis]);

  return (
    <div className="site-header-wrapper" data-open={open || undefined}>
      <header className="site-header" data-scrolled={scrolled || open || undefined}>
        <div className="shell site-header-inner">
          <CursorLink href="/" className="site-logo" aria-label="Jkrafts home">
            <Image src="/logo.png" alt="" width={81} height={40} priority className="site-logo-img" />
          </CursorLink>

          <nav aria-label="Main" className="site-nav">
            <ul>
              {navItems
                .filter((item) => item.href !== '/')
                .map((item) => (
                  <li key={item.href}>
                    <CursorLink
                      href={item.href}
                      className="site-nav-link"
                      aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
                    >
                      {item.label}
                    </CursorLink>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="site-header-actions">
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setMenu(!openRef.current)}
            >
              <span className="menu-toggle-text" aria-hidden="true">
                {open ? 'Close' : 'Menu'}
              </span>
              <span className="menu-toggle-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div ref={layersRef} className="menu-layers" aria-hidden="true">
        <div className="menu-layer menu-layer-1" />
        <div className="menu-layer menu-layer-2" />
      </div>

      <div
        ref={panelRef}
        id="site-menu"
        className="menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
      >
        <div className="shell menu-panel-inner">
          <nav aria-label="Menu">
            <ul className="menu-list">
              {navItems.map((item) => {
                const current = isCurrent(pathname, item.href);
                return (
                  <li key={item.href} className="menu-item">
                    <CursorLink
                      href={item.href}
                      className="menu-item-link"
                      aria-current={current ? 'page' : undefined}
                      onClick={() => {
                        // Same-page link: no route change will close it for us.
                        if (current) setMenu(false, { restoreFocus: false });
                      }}
                    >
                      <span className="menu-item-label">{item.label}</span>
                    </CursorLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="menu-footer">
            <a href={`mailto:${contact.email}`} className="link t-lead self-start">
              {contact.email}
            </a>
            <ul className="menu-socials">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="menu-social">
                    <Icon name={s.icon} size={20} />
                    <span>{s.label}</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
