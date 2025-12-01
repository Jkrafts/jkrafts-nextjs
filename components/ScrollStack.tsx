'use client';

import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLenis } from '@/providers/LenisProvider';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div
    className={`scroll-stack-card ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, any>());
  const isUpdatingRef = useRef(false);
  const stackCompletedRef = useRef(false);
  const initialCardOffsetsRef = useRef<number[]>([]);
  const initialEndOffsetRef = useRef<number>(0);

  const lenis = useLenis(); // use global Lenis

  const getScrollTop = useCallback(() => {
    if (!lenis) return window.scrollY;
    return useWindowScroll ? lenis.scroll : scrollerRef.current?.scrollTop ?? 0;
  }, [lenis, useWindowScroll]);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getElementOffset = useCallback(
    (el: HTMLElement) => {
      if (useWindowScroll) {
        return el.getBoundingClientRect().top + window.scrollY;
      }
      return el.offsetTop;
    },
    [useWindowScroll]
  );

  const computeInitialOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    initialCardOffsetsRef.current = cards.map(card => getElementOffset(card));

    const endEl = useWindowScroll
      ? (document.querySelector('.scroll-stack-end') as HTMLElement | null)
      : scrollerRef.current?.querySelector('.scroll-stack-end') ?? null;

    initialEndOffsetRef.current = endEl ? getElementOffset(endEl) : 0;
  }, [getElementOffset, useWindowScroll]);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const scrollTop = getScrollTop();
    const containerHeight = useWindowScroll ? window.innerHeight : scrollerRef.current?.clientHeight ?? 0;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endTop = initialEndOffsetRef.current;

    cardsRef.current.forEach((card, i) => {
      const cardTop = initialCardOffsetsRef.current[i] ?? getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = initialCardOffsetsRef.current[j] ?? getElementOffset(cardsRef.current[j]);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) blur = Math.max(0, topCardIndex - i) * blurAmount;
      }

      let translateY = Math.min(Math.max(scrollTop - triggerStart, 0), endTop - cardTop);

      const newTransform = {
        translateY,
        scale,
        rotation,
        blur
      };

      const last = lastTransformsRef.current.get(i);
      if (!last || JSON.stringify(last) !== JSON.stringify(newTransform)) {
        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        card.style.filter = blur ? `blur(${blur}px)` : '';
        lastTransformsRef.current.set(i, newTransform);
      }

      // trigger stack completion
      if (i === cardsRef.current.length - 1) {
        const inView = scrollTop >= triggerStart && scrollTop <= endTop;
        if (inView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!inView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    blurAmount,
    baseScale,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    rotationAmount,
    getScrollTop,
    useWindowScroll,
    onStackComplete,
    getElementOffset,
    parsePercentage,
    calculateProgress
  ]);

  useLayoutEffect(() => {
    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scrollerRef.current?.querySelectorAll('.scroll-stack-card') ?? []
    ) as HTMLElement[];
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.perspective = '1000px';
    });

    computeInitialOffsets();
    updateCardTransforms();

    const onScroll = () => updateCardTransforms();
    if (lenis && useWindowScroll) lenis.on('scroll', onScroll);
    else window.addEventListener('scroll', onScroll);

    const onResize = () => {
      computeInitialOffsets();
      updateCardTransforms();
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (lenis && useWindowScroll) lenis.off('scroll', onScroll);
      else window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      initialCardOffsetsRef.current = [];
      initialEndOffsetRef.current = 0;
    };
  }, [
    lenis,
    itemDistance,
    useWindowScroll,
    computeInitialOffsets,
    updateCardTransforms
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner pt-[20vh] px-20 pb-200">
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;
