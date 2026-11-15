'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import './TargetCursor.css';

export interface TargetCursorProps {
  targetSelector?: string;
  hoverDuration?: number;
}

const BORDER = 2;
const CORNER = 10;

// Resting offsets of the four corner brackets around the pointer.
const restPositions = [
  { x: -CORNER * 1.5, y: -CORNER * 1.5 },
  { x: CORNER * 0.5, y: -CORNER * 1.5 },
  { x: CORNER * 0.5, y: CORNER * 0.5 },
  { x: -CORNER * 1.5, y: CORNER * 0.5 },
];

/**
 * A pointer that frames whatever interactive element is under it.
 *
 * Only enabled for fine pointers that can hover (mouse/trackpad) and when the
 * visitor has not asked for reduced motion. The markup is always rendered so
 * the server and client agree (rendering `null` on touch devices caused a
 * hydration mismatch); it stays hidden via CSS until `html.has-target-cursor`
 * is set. There is no idle spin: the cursor only moves in response to the
 * visitor.
 */
const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = '.cursor-target, a[href], button:not(:disabled), [role="button"], label[for]',
  hoverDuration = 0.2,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let teardown: (() => void) | null = null;

    const setup = () => {
      const root = document.documentElement;
      root.classList.add('has-target-cursor');

      const corners = Array.from(cursor.querySelectorAll<HTMLDivElement>('.target-cursor-corner'));
      corners.forEach((c, i) => gsap.set(c, restPositions[i]));
      gsap.set(cursor, { x: -100, y: -100, autoAlpha: 0 });

      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power3.out' });

      let activeTarget: Element | null = null;
      let pointer = { x: -100, y: -100 };
      let visible = false;

      // Corner offsets are relative to the cursor, which trails the pointer,
      // so they're computed against the *pointer* position (where the cursor
      // is heading) to avoid the brackets lagging behind the element.
      const frameTarget = (target: Element) => {
        const rect = target.getBoundingClientRect();
        const pad = 4;
        const targets = [
          { x: rect.left - pad - BORDER, y: rect.top - pad - BORDER },
          { x: rect.right + pad + BORDER - CORNER, y: rect.top - pad - BORDER },
          { x: rect.right + pad + BORDER - CORNER, y: rect.bottom + pad + BORDER - CORNER },
          { x: rect.left - pad - BORDER, y: rect.bottom + pad + BORDER - CORNER },
        ];
        corners.forEach((corner, i) => {
          gsap.to(corner, {
            x: targets[i].x - pointer.x,
            y: targets[i].y - pointer.y,
            duration: hoverDuration,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };

      const release = () => {
        if (!activeTarget) return;
        activeTarget = null;
        cursor.classList.remove('is-framing');
        corners.forEach((corner, i) => {
          gsap.to(corner, { ...restPositions[i], duration: 0.25, ease: 'power3.out', overwrite: 'auto' });
        });
      };

      const findTarget = (el: Element | null) => (el && el.closest ? el.closest(targetSelector) : null);

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        pointer = { x: e.clientX, y: e.clientY };
        if (!visible) {
          visible = true;
          gsap.set(cursor, { x: pointer.x, y: pointer.y });
          gsap.to(cursor, { autoAlpha: 1, duration: 0.2 });
        }
        xTo(pointer.x);
        yTo(pointer.y);
        if (activeTarget) frameTarget(activeTarget);
      };

      const onOver = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const target = findTarget(e.target as Element);
        if (target === activeTarget) return;
        if (!target) {
          release();
          return;
        }
        activeTarget = target;
        cursor.classList.add('is-framing');
        frameTarget(target);
      };

      const onScroll = () => {
        if (!activeTarget) return;
        const target = findTarget(document.elementFromPoint(pointer.x, pointer.y));
        if (target !== activeTarget) release();
        else frameTarget(activeTarget);
      };

      const onLeaveWindow = () => {
        visible = false;
        gsap.to(cursor, { autoAlpha: 0, duration: 0.2 });
        release();
      };

      const onDown = () => gsap.to(dot, { scale: 0.6, duration: 0.15 });
      const onUp = () => gsap.to(dot, { scale: 1, duration: 0.2 });

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      root.addEventListener('pointerleave', onLeaveWindow);

      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerover', onOver);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointerleave', onLeaveWindow);
        gsap.killTweensOf([cursor, dot, ...corners]);
        root.classList.remove('has-target-cursor');
      };
    };

    const sync = () => {
      const shouldEnable = fine.matches && !reduced.matches;
      if (shouldEnable && !teardown) teardown = setup();
      if (!shouldEnable && teardown) {
        teardown();
        teardown = null;
      }
    };

    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);

    return () => {
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
      teardown?.();
    };
  }, [targetSelector, hoverDuration]);

  return (
    <div ref={cursorRef} className="target-cursor-wrapper" aria-hidden="true">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
