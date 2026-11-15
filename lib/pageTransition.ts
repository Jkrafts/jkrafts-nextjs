/**
 * Page transition: a grid curtain with a title handoff.
 *
 * Cover (~0.5s)
 *  - The curtain is the site's layout grid: 12 columns (6 on phones), each a
 *    lilac strip leading an indigo one, rising from the bottom in a wave that
 *    starts where the visitor clicked (the centre, for keyboard activation).
 *  - The old page drifts up and dims; its headline's lines slide up out of
 *    their masks.
 *  - The header stays above the curtain (its text turns white over indigo)
 *    and the nav underline slides from the current link to the new one.
 *
 * Route change, underneath, once covered.
 *
 * Reveal (~0.6s, plus the page's last settle)
 *  - The new page's own h1 is copied onto the curtain in white, registered
 *    on the real headline's first letter, and its lines rise into place.
 *  - The columns lift away in the same wave. The white copy is clipped to
 *    the indigo still covering it, so as each column lifts the letters behind
 *    it turn into the real, ink headline a strip at a time: the handoff.
 *  - The new page (and the copy, by exactly the same amount) settles up from
 *    below.
 *
 * Performance: columns move with transforms only (compositor work, no
 * paint); the old page is dimmed by a layer of the overlay, not opacity on
 * <main>; the copy's clip is the only per-frame update, and only during the
 * reveal; the hero's WebGL holds still from the click until the reveal ends
 * (`isPageCovered`), drawing one warm-up frame under the curtain on arrival.
 *
 * Reduced motion: a 150ms fade through the page colour instead.
 * Back/forward navigation doesn't use this (see components/PageTransition.tsx).
 *
 * The overlay lives on <body>, outside React, so it survives the route
 * change. It sits under the site header (z-index 60), except when a project
 * story (a fixed dialog above the header) is open.
 */
import { gsap, SplitText } from '@/lib/gsap';

const INDIGO = '#4b32e0';
const LILAC = '#b19eef';
const FAILSAFE_MS = 5000;
const UNDER_HEADER = 58;
const OVER_EVERYTHING = 1200;

type Overlay = {
  root: HTMLDivElement;
  /** Dims the old page. A layer of its own: opacity on <main> would force
      its whole subtree (the hero's WebGL canvas included) to be blended
      off-screen every frame. */
  scrim: HTMLDivElement | null;
  lilac: HTMLDivElement[];
  indigo: HTMLDivElement[];
  /** Holds the white copy of the new headline (above the columns). */
  title: HTMLDivElement;
  /** Panel used instead of columns under reduced motion. */
  fade: HTMLDivElement | null;
};

type Pending = {
  url: URL;
  overlay: Overlay;
  reduced: boolean;
  origin: number;
  covered: Promise<void>;
  revealing: boolean;
  failsafe: number;
  /** Undo what the cover did to the old page, if the route never arrives. */
  undo: (() => void)[];
  /** A link clicked mid-transition (the header stays clickable above the
      curtain): followed once this one finishes, latest click wins. */
  queued: { href: string; navigate: () => void; originX: number | null } | null;
};

let pending: Pending | null = null;
let covered = false;

/** True from the click until the new page is revealed. Pages can use it to
    hold back intro animations the curtain would otherwise hide. */
export const isPageTransitionActive = () => pending !== null;

/** Fired on window whenever `isPageCovered()` changes. */
export const PAGE_COVER_EVENT = 'pagecoverchange';

/** True from the click until the new page is fully revealed: expensive
    animation on the page (the hero's WebGL) holds still meanwhile, so the
    curtain's motion never competes with it for frames. */
export const isPageCovered = () => covered;

function setCovered(value: boolean) {
  if (covered === value) return;
  covered = value;
  window.dispatchEvent(new Event(PAGE_COVER_EVENT));
}

/** White header text while it sits over the curtain (see Navbar.css). */
const setHeaderOnCurtain = (on: boolean) => document.documentElement.classList.toggle('pt-header', on);

const columnCount = () => (window.innerWidth >= 768 ? 12 : 6);

/* ---------------------------------------------------------------------------
   Overlay
   --------------------------------------------------------------------------- */

function createOverlay(reduced: boolean): Overlay {
  const root = document.createElement('div');
  root.className = 'page-transition';
  root.setAttribute('aria-hidden', 'true');
  const storyOpen = document.documentElement.classList.contains('story-open');
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    zIndex: String(storyOpen ? OVER_EVERYTHING : UNDER_HEADER),
    pointerEvents: 'auto',
    overflow: 'hidden',
  });

  const title = document.createElement('div');
  Object.assign(title.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });

  if (reduced) {
    const fade = document.createElement('div');
    Object.assign(fade.style, { position: 'absolute', inset: '0', background: 'var(--paper)', opacity: '0' });
    root.append(fade, title);
    document.body.append(root);
    return { root, scrim: null, lilac: [], indigo: [], title, fade };
  }

  const n = columnCount();
  const makeColumns = (colour: string) =>
    Array.from({ length: n }, (_, i) => {
      const col = document.createElement('div');
      Object.assign(col.style, {
        position: 'absolute',
        top: '0',
        bottom: '0',
        // Overlap by a pixel so subpixel edges never show a seam.
        left: `calc(${(i / n) * 100}% - 0.5px)`,
        width: `calc(${100 / n}% + 1px)`,
        background: colour,
        willChange: 'transform',
      });
      return col;
    });
  const scrim = document.createElement('div');
  Object.assign(scrim.style, { position: 'absolute', inset: '0', background: '#0d0b22', opacity: '0' });
  const lilac = makeColumns(LILAC);
  const indigo = makeColumns(INDIGO);
  // Parked below the screen. GSAP must own this transform: a CSS translate
  // here would be read as an extra offset on top of its yPercent.
  gsap.set([...lilac, ...indigo], { yPercent: 100 });
  root.append(scrim, ...lilac, ...indigo, title);
  document.body.append(root);
  return { root, scrim, lilac, indigo, title, fade: null };
}

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */

/** Box of the first visible character inside `el`. */
function firstGlyph(el: HTMLElement): DOMRect | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const i = node.data.search(/\S/);
    if (i === -1) continue;
    const range = document.createRange();
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    return range.getBoundingClientRect();
  }
  return null;
}

/** Split a headline into masked lines. Headlines built from block-level
    lines (the home hero) are split block by block: splitting the whole
    element would add empty line boxes and push later lines out of register. */
function splitLines(el: HTMLElement): SplitText[] {
  const blocks = Array.from(el.children).filter((c) => getComputedStyle(c).display === 'block') as HTMLElement[];
  const targets = blocks.length && blocks.length === el.children.length ? blocks : [el];
  return targets.map((t) => SplitText.create(t, { type: 'lines', mask: 'lines' }));
}

const inView = (r: DOMRect) => r.bottom > 0 && r.top < window.innerHeight;

/** The page's moving parts: the route's content and the persistent footer. */
const pageParts = () =>
  Array.from(document.querySelectorAll<HTMLElement>('main, body footer')).filter((el) => !el.closest('.page-transition'));

/**
 * Slide the desktop nav's underline from the current link to the one for
 * `path`. Returns a cleanup, run once the new page marks its own link.
 */
function slideNavIndicator(path: string): (() => void) | null {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  if (!nav || getComputedStyle(nav).display === 'none') return null;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a.site-nav-link'));
  const from = links.find((a) => a.getAttribute('aria-current') === 'page');
  const to = links.find((a) => new URL(a.href).pathname === path);
  if (!from && !to) return null;

  const navBox = nav.getBoundingClientRect();
  const place = (a: HTMLAnchorElement) => {
    const r = a.getBoundingClientRect();
    return { x: r.left - navBox.left, y: r.bottom - navBox.top - 5.2, w: r.width };
  };
  const a = from ? place(from) : null;
  const b = to ? place(to) : null;
  // Grow from / shrink into the middle of a link when there's no other end.
  const start = a ?? { x: b!.x + b!.w / 2, y: b!.y, w: 0 };
  const end = b ?? { x: a!.x + a!.w / 2, y: a!.y, w: 0 };

  const bar = document.createElement('span');
  bar.className = 'site-nav-indicator';
  bar.setAttribute('aria-hidden', 'true');
  nav.append(bar);
  nav.classList.add('is-moving');
  gsap.fromTo(
    bar,
    { x: start.x, y: start.y, width: start.w },
    { x: end.x, y: end.y, width: end.w, duration: 0.6, ease: 'expo.inOut' },
  );
  return () => {
    gsap.killTweensOf(bar);
    bar.remove();
    nav.classList.remove('is-moving');
  };
}

function finish(entry: Pending) {
  window.clearTimeout(entry.failsafe);
  entry.overlay.root.remove();
  if (pending === entry) {
    pending = null;
    setCovered(false);
    setHeaderOnCurtain(false);
    const next = entry.queued;
    if (next && new URL(next.href, window.location.href).pathname !== window.location.pathname) {
      startPageTransition(next.href, next.navigate, next.originX);
    }
  }
}

/* ---------------------------------------------------------------------------
   Cover
   --------------------------------------------------------------------------- */

/**
 * Cover the page, then call `navigate`. `originX` is the click's x position
 * (null for keyboard activation). While one is running, the latest request
 * is queued and follows when it finishes.
 */
export function startPageTransition(href: string, navigate: () => void, originX: number | null = null): void {
  if (pending) {
    pending.queued = { href, navigate, originX };
    return;
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = createOverlay(reduced);
  const url = new URL(href, window.location.href);
  const n = overlay.indigo.length || 1;
  const origin = originX === null ? Math.floor(n / 2) : Math.min(n - 1, Math.max(0, Math.floor((originX / window.innerWidth) * n)));
  const undo: (() => void)[] = [];

  setCovered(true);

  const covered = new Promise<void>((resolve) => {
    if (reduced) {
      gsap.to(overlay.fade, { opacity: 1, duration: 0.15, ease: 'none', onComplete: resolve });
      return;
    }

    const wave = { amount: 0.1, from: origin };
    const tl = gsap.timeline({ onComplete: resolve });
    tl.fromTo(overlay.lilac, { yPercent: 100 }, { yPercent: 0, duration: 0.36, ease: 'power4.inOut', stagger: wave }, 0)
      .fromTo(overlay.indigo, { yPercent: 100 }, { yPercent: 0, duration: 0.36, ease: 'power4.inOut', stagger: wave }, 0.045)
      // The header is over indigo from about here.
      .call(() => setHeaderOnCurtain(true), undefined, 0.3);

    // The old page drifts up and dims beneath the rising columns. (Not
    // with a story open: transforming <main> would re-anchor that fixed
    // dialog, which is above the curtain.)
    const parts = document.documentElement.classList.contains('story-open') ? [] : pageParts();
    if (parts.length) tl.to(parts, { y: () => -window.innerHeight * 0.06, duration: 0.55, ease: 'power2.in' }, 0);
    tl.to(overlay.scrim, { opacity: 0.4, duration: 0.45, ease: 'power2.in' }, 0);
    undo.push(() => gsap.set(parts, { clearProps: 'transform' }));

    // Its headline leaves first: lines slide up out of their masks.
    const oldTitle = document.querySelector<HTMLElement>('main h1');
    if (oldTitle && inView(oldTitle.getBoundingClientRect())) {
      const splits = splitLines(oldTitle);
      tl.to(splits.flatMap((s) => s.lines), { yPercent: -105, duration: 0.38, ease: 'power3.in', stagger: 0.04 }, 0);
      undo.push(() => splits.forEach((s) => s.revert()));
    }

    const navDone = slideNavIndicator(url.pathname);
    if (navDone) undo.push(navDone);
  });

  const entry: Pending = {
    url,
    overlay,
    reduced,
    origin,
    covered,
    revealing: false,
    undo,
    queued: null,
    // Never leave the site covered if the route never arrives.
    failsafe: window.setTimeout(() => {
      if (pending !== entry) return;
      entry.undo.forEach((fn) => fn());
      gsap.to(overlay.root, { opacity: 0, duration: 0.25, onComplete: () => finish(entry) });
    }, FAILSAFE_MS),
  };
  pending = entry;

  covered.then(() => {
    if (pending === entry) navigate();
  });
}

/* ---------------------------------------------------------------------------
   Reveal
   --------------------------------------------------------------------------- */

/**
 * The new route has rendered underneath: hand the headline over and reveal
 * it. `scrollToTop` must jump instantly (the page is covered).
 */
export function completePageTransition(scrollToTop: () => void) {
  const entry = pending;
  if (!entry || entry.revealing) return;
  entry.revealing = true;

  entry.covered.then(() => {
    // A link with a hash (e.g. "#project-form") lands on that section, so
    // there's no headline at the top to hand over.
    const toSection = entry.url.hash.length > 1;
    if (!toSection) scrollToTop();

    requestAnimationFrame(() => {
      const { overlay } = entry;
      // The old page's cleanups (nav underline, its headline) are moot now:
      // the new page has marked its own nav link.
      entry.undo.forEach((fn) => fn());
      const h1 = document.querySelector<HTMLElement>('main h1');
      const parts = pageParts();

      const done = () => {
        gsap.set(parts, { clearProps: 'transform' });
        finish(entry);
        // Start keyboard and screen reader users at the new page's title.
        if (h1 && !toSection) {
          if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
          h1.focus({ preventScroll: true });
        }
      };

      if (entry.reduced) {
        setCovered(false);
        setHeaderOnCurtain(false);
        gsap.to(overlay.fade, { opacity: 0, duration: 0.15, ease: 'none', onComplete: done });
        return;
      }

      const H = window.innerHeight;
      const rise = H * 0.08;
      const rect = h1?.getBoundingClientRect();
      const handOver = !!h1 && !!rect && !toSection && inView(rect);

      // Lilac only leads on the way in; the indigo carries the reveal over
      // the new page (undimmed).
      gsap.set([...overlay.lilac, overlay.scrim], { autoAlpha: 0 });

      const tl = gsap.timeline({ onComplete: done });
      let revealAt = 0.08;

      if (handOver && h1 && rect) {
        // The new page's own headline, in white, exactly where it sits.
        const copy = h1.cloneNode(true) as HTMLElement;
        copy.removeAttribute('id');
        copy.removeAttribute('data-intro');
        copy.removeAttribute('tabindex');
        Object.assign(copy.style, {
          position: 'absolute',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          margin: '0',
          color: '#fff',
          opacity: '1',
        });
        overlay.title.append(copy);
        // Register on the first letter, not the box (a child's negative
        // margin can collapse through the real h1 but not the copy).
        const real = firstGlyph(h1);
        const mine = firstGlyph(copy);
        if (real && mine) {
          copy.style.left = `${rect.left + real.left - mine.left}px`;
          copy.style.top = `${rect.top + real.top - mine.top}px`;
        }
        const lines = splitLines(copy).flatMap((s) => s.lines);
        tl.from(lines, { yPercent: 105, duration: 0.5, ease: 'expo.out', stagger: 0.05 }, 0);
        // Columns uncover the bottom of the screen first: a low headline
        // (the home hero) needs its lines up before they're reached.
        if (rect.top > H / 2) revealAt = 0.24;
      }

      // The white copy shows only where indigo still covers the page, so the
      // headline changes to the real one column by column.
      const clipTitle = () => {
        const W = window.innerWidth;
        const n = overlay.indigo.length;
        const points = ['0px 0px'];
        overlay.indigo.forEach((col, i) => {
          const bottom = H * (1 + (gsap.getProperty(col, 'yPercent') as number) / 100);
          points.push(`${(i / n) * W}px ${bottom}px`, `${((i + 1) / n) * W}px ${bottom}px`);
        });
        points.push(`${W}px 0px`);
        overlay.title.style.clipPath = `polygon(${points.join(',')})`;
      };

      tl.to(
          overlay.indigo,
          {
            yPercent: -100,
            duration: 0.5,
            ease: 'power4.inOut',
            stagger: { amount: 0.1, from: entry.origin },
            onUpdate: handOver ? clipTitle : undefined,
            // Columns gone: let clicks through while the page settles.
            onComplete: () => {
              overlay.root.style.pointerEvents = 'none';
            },
          },
          revealAt,
        )
        // The new page, and the copy with it, settle up from below.
        .fromTo([...parts, overlay.title], { y: rise }, { y: 0, duration: 0.7, ease: 'expo.out' }, revealAt)
        // The top of the screen is uncovered last.
        .call(() => setHeaderOnCurtain(false), undefined, revealAt + 0.4);

      if (handOver) clipTitle();

      // The rest of the page's opening settles in behind the headline.
      const lead = document.querySelectorAll<HTMLElement>('main [data-page-lead]');
      if (lead.length && !toSection) {
        gsap.from(lead, {
          y: 18,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: revealAt + 0.3,
          clearProps: 'opacity,transform',
        });
      }
    });
  });
}
