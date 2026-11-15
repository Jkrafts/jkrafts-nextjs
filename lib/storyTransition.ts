/**
 * Shared-element transition between a row in the home page's work index
 * and that project's story on /projects.
 *
 * The two ends live on different routes, so neither can animate into the
 * other directly. Instead a fixed overlay is appended to <body> (outside
 * React, so it survives the route change): its accent-coloured panel is
 * clipped to the row's rectangle and opened up to the story frame's
 * rectangle while the next page loads underneath. Once the story is open
 * beneath it the overlay hands off and is removed. Closing a story that was
 * entered this way plays the same thing in reverse, back into the row.
 *
 * Only used when motion is allowed; with reduced motion the row is a plain
 * link to /projects?story=<id>.
 */
import { gsap } from '@/lib/gsap';

type Box = { top: number; left: number; width: number; height: number; radius: number };

type Overlay = {
  root: HTMLDivElement;
  backdrop: HTMLDivElement;
  panel: HTMLDivElement;
  /** The story cover's surface (gradient + pattern) over the frame's area. */
  shade: HTMLDivElement;
};

/** CSS variables from `patternStyle()`. */
type PatternVars = Record<string, string>;

type Incoming = {
  id: string;
  overlay: Overlay;
  expanded: Promise<void>;
  handedOff: boolean;
  failsafe: number;
};

type Returning = {
  id: string;
  overlay: Overlay;
  failsafe: number;
};

const EASE = 'expo.inOut';
const FAILSAFE_MS = 4000;

let incoming: Incoming | null = null;
let returning: Returning | null = null;
// Where the row sat in the viewport when the visitor left, so the return
// can put the page back exactly as it was.
let departureTop: number | null = null;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const radiusPx = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 0;

/**
 * The story frame's rectangle, mirroring stories-slide.css: centred, at
 * most 414×860, with 12px vertical padding and rounded corners once the
 * viewport is wider than a phone. Measured against the full viewport
 * (scrollbar included), because the page scroll is locked while a story is
 * open and the frame is centred in that wider box.
 */
function storyFrame(): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padded = vw >= 415 || vh >= 897;
  const width = Math.min(vw, 414);
  const height = Math.min(padded ? vh - 24 : vh, 860);
  return {
    left: (vw - width) / 2,
    top: (vh - height) / 2,
    width,
    height,
    radius: vw >= 415 ? radiusPx() : 0,
  };
}

function toBox(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, radius: radiusPx() };
}

/** clip-path that shows only `box`; the same shape for every box, so GSAP can interpolate it. */
function clipTo(box: Box): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const right = vw - (box.left + box.width);
  const bottom = vh - (box.top + box.height);
  return `inset(${box.top}px ${right}px ${bottom}px ${box.left}px round ${box.radius}px)`;
}

function backdropColour() {
  const padded = window.innerWidth >= 415 || window.innerHeight >= 897;
  return padded ? 'rgb(13 11 34 / 0.96)' : '#0d0b22';
}

function createOverlay(accent: string, frame: Box, pattern?: PatternVars): Overlay {
  const root = document.createElement('div');
  root.className = 'story-transition';
  root.setAttribute('aria-hidden', 'true');
  Object.assign(root.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${window.innerWidth}px`,
    height: `${window.innerHeight}px`,
    zIndex: '1100',
    pointerEvents: 'auto',
  });

  const backdrop = document.createElement('div');
  Object.assign(backdrop.style, {
    position: 'absolute',
    inset: '0',
    background: backdropColour(),
    opacity: '0',
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'absolute',
    inset: '0',
    background: accent,
    willChange: 'clip-path',
  });

  // Same surface as a story's cover, laid over the frame's area: the
  // fall-off to ink, plus the project's pattern exactly as the cover
  // positions it (chapter 0, masked the same way), so the handoff is exact.
  const shade = document.createElement('div');
  Object.assign(shade.style, {
    position: 'absolute',
    left: `${frame.left}px`,
    top: `${frame.top}px`,
    width: `${frame.width}px`,
    height: `${frame.height}px`,
    backgroundImage: 'linear-gradient(180deg, transparent 35%, rgb(13 11 34 / 0.45))',
    opacity: '0',
  });
  if (pattern) {
    const texture = document.createElement('div');
    for (const [k, v] of Object.entries(pattern)) texture.style.setProperty(k, v);
    Object.assign(texture.style, {
      position: 'absolute',
      inset: '0',
      backgroundImage: 'var(--pattern)',
      backgroundSize: 'var(--pattern-size)',
      backgroundPosition: '0 0',
      maskImage: 'var(--pattern-mask)',
      webkitMaskImage: 'var(--pattern-mask)',
    });
    shade.append(texture);
  }

  panel.append(shade);
  root.append(backdrop, panel);
  document.body.append(root);
  return { root, backdrop, panel, shade };
}

/** A non-interactive copy of the row's content, shown in its flooded state. */
function cloneRow(row: HTMLElement, box: Box, accent: string): HTMLElement {
  const label = document.createElement('div');
  label.className = row.className;
  label.dataset.lifted = '';
  label.innerHTML = row.innerHTML;
  label.style.setProperty('--accent', accent);
  Object.assign(label.style, {
    position: 'absolute',
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    margin: '0',
    boxSizing: 'border-box',
  });
  return label;
}

function removeOverlay(overlay: Overlay, duration = 0.25) {
  gsap.killTweensOf([overlay.root, overlay.backdrop, overlay.panel, overlay.shade]);
  gsap.to(overlay.root, {
    opacity: 0,
    duration,
    ease: 'power1.out',
    onComplete: () => overlay.root.remove(),
  });
}

/* ---------------------------------------------------------------------------
   Home → story
   --------------------------------------------------------------------------- */

/**
 * Lift `row` into the story frame, calling `navigate` partway through, once
 * the current page is covered.
 */
export function playStoryEnter(
  row: HTMLElement,
  id: string,
  accent: string,
  pattern: PatternVars | undefined,
  navigate: () => void,
) {
  if (incoming) removeOverlay(incoming.overlay, 0);

  const from = toBox(row);
  const frame = storyFrame();
  const overlay = createOverlay(accent, frame, pattern);
  const label = cloneRow(row, from, accent);
  overlay.root.append(label);
  overlay.panel.style.clipPath = clipTo(from);
  departureTop = from.top;

  const expanded = new Promise<void>((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .to(label, { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in' }, 0)
      .to(overlay.backdrop, { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.05)
      // Explicit start: the computed clip-path collapses equal insets
      // ("inset(20px 513px)"), which would misalign the interpolation.
      .fromTo(overlay.panel, { clipPath: clipTo(from) }, { clipPath: clipTo(frame), duration: 0.8, ease: EASE }, 0.05)
      .to(overlay.shade, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 0.4)
      // Swap routes only once the backdrop hides the page, so the next one
      // never shows through. It still loads well before the panel settles.
      .call(navigate, undefined, 0.5);
  });

  const entry: Incoming = {
    id,
    overlay,
    expanded,
    handedOff: false,
    // If the story never claims the overlay (navigation failed, unknown
    // id), don't leave the page covered.
    failsafe: window.setTimeout(() => {
      if (incoming === entry) {
        incoming = null;
        removeOverlay(overlay);
      }
    }, FAILSAFE_MS),
  };
  incoming = entry;
}

/** True when the story `id` is being entered through the transition. */
export function hasIncomingStory(id: string) {
  return incoming?.id === id;
}

/**
 * Called by the story page. Waits for the panel to finish opening, calls
 * `open` (which must show the story instantly, with no entrance animation
 * of its own), then fades the overlay away over it and brings in the
 * cover's content. Safe to call more than once (React strict mode).
 */
export function completeStoryEnter(id: string, open: () => HTMLElement | null) {
  const entry = incoming;
  if (!entry || entry.id !== id) return;

  entry.expanded.then(() => {
    if (entry.handedOff) return;
    entry.handedOff = true;
    window.clearTimeout(entry.failsafe);
    if (incoming === entry) incoming = null;

    // The cover's own entrance (chapterMotion.ts) plays as it opens.
    open();
    requestAnimationFrame(() => {
      removeOverlay(entry.overlay, 0.2);
    });
  });
}

/* ---------------------------------------------------------------------------
   Story → home
   --------------------------------------------------------------------------- */

/**
 * Cover the story frame with the overlay (fully opened, as at the end of
 * the entrance), so the story can be hidden instantly and the previous page
 * restored underneath. `navigate` should go back to the home page.
 */
export function playStoryReturn(
  id: string,
  accent: string,
  pattern: PatternVars | undefined,
  navigate: () => void,
) {
  if (returning) removeOverlay(returning.overlay, 0);

  const frame = storyFrame();
  const overlay = createOverlay(accent, frame, pattern);
  overlay.backdrop.style.opacity = '1';
  overlay.shade.style.opacity = '1';
  overlay.panel.style.clipPath = clipTo(frame);

  const entry: Returning = {
    id,
    overlay,
    failsafe: window.setTimeout(() => {
      if (returning === entry) {
        returning = null;
        removeOverlay(overlay);
      }
    }, FAILSAFE_MS),
  };
  returning = entry;

  navigate();
}

/**
 * Called by the work index when it mounts. If a story is returning, scroll
 * its row back to where it was and close the panel into it.
 * `scrollTo` must jump instantly (no smoothing).
 */
export function completeStoryReturn(
  findRow: (id: string) => HTMLElement | null,
  scrollTo: (y: number) => void,
) {
  const entry = returning;
  if (!entry) return;
  returning = null;
  window.clearTimeout(entry.failsafe);

  const row = findRow(entry.id);
  if (!row) {
    removeOverlay(entry.overlay);
    return;
  }

  // Put the row back where it sat when the visitor left (or centre it).
  const rowTop = row.getBoundingClientRect().top + window.scrollY;
  const targetTop =
    departureTop ?? Math.max(0, (window.innerHeight - row.offsetHeight) / 2);
  scrollTo(Math.max(0, rowTop - targetTop));
  departureTop = null;

  requestAnimationFrame(() => {
    const to = toBox(row);
    const accent = entry.overlay.panel.style.background;
    const label = cloneRow(row, to, accent);
    label.style.opacity = '0';
    entry.overlay.root.append(label);

    gsap
      .timeline({
        onComplete: () => {
          entry.overlay.root.remove();
          row.focus({ preventScroll: true });
        },
      })
      .to(entry.overlay.shade, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0)
      .fromTo(entry.overlay.panel, { clipPath: clipTo(storyFrame()) }, { clipPath: clipTo(to), duration: 0.75, ease: EASE }, 0)
      .to(entry.overlay.backdrop, { opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0.2)
      .fromTo(label, { y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.6)
      // Settle from the flooded state back into the row's resting state.
      .to([entry.overlay.panel, label], { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.95);
  });
}
