'use client';

import React, { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import Swiper from 'swiper';
import { EffectCube } from 'swiper/modules';
import { StoriesSlider, Stories, Story } from '@/lib/swiper';
import { patternStyle, type ProjectStory } from '@/data/projects';
import { useLenis } from '@/providers/LenisProvider';
import { gsap } from '@/lib/gsap';
import { SlideRenderer } from './SlideRenderer';
import { animateChapter } from './chapterMotion';

import 'swiper/css';
import 'swiper/css/effect-cube';
import '@/lib/swiper/stories-slide.css';

interface StoriesSliderInstance {
  el: HTMLElement;
  enable: () => void;
  disable: () => void;
  pause: (preventTouchResume?: boolean) => void;
  resume: () => void;
  slideTo: (mainIndex: number, subIndex?: number) => void;
}

export interface StorySliderHandle {
  /** Opens project `index`; returns its first slide. `instant` skips the entrance animation. */
  open: (index: number, options?: { instant?: boolean }) => HTMLElement | null;
  close: () => void;
}

interface StorySliderProps {
  projects: ProjectStory[];
  onClose?: () => void;
  /**
   * Called on close with the index of the project being viewed. Return
   * true to take over the exit (the viewer then hides instantly and leaves
   * focus alone, and `onClose` is not called).
   */
  onReturn?: (projectIndex: number) => boolean;
}

const SLIDE_DURATION = 5000;
const VIDEO_SLIDE_DURATION = 12000;

const ProjectsSlider = forwardRef<StorySliderHandle, StorySliderProps>(({ projects, onClose, onReturn }, ref) => {
  const sliderRef = useRef<StoriesSliderInstance | null>(null);
  const isOpenRef = useRef(false);
  const pausedRef = useRef(false);
  // The last chapter's end-card animation (see handleComplete).
  const endCardRef = useRef<gsap.core.Timeline | null>(null);
  // The showing chapter's entrance (chapterMotion.ts).
  const chapterMotionRef = useRef<gsap.Context | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const onReturnRef = useRef(onReturn);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    onCloseRef.current = onClose;
    onReturnRef.current = onReturn;
    lenisRef.current = lenis;
  }, [onClose, onReturn, lenis]);

  const activeSlide = () =>
    sliderRef.current?.el.querySelector<HTMLElement>(
      '.swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active',
    ) ?? null;

  // Undo the end card: back to the chapter's normal layout.
  const resetEndCard = () => {
    endCardRef.current?.revert();
    endCardRef.current = null;
    sliderRef.current?.el.querySelectorAll('[data-complete]').forEach((el) => el.removeAttribute('data-complete'));
  };

  // Play the showing chapter's entrance, undoing the previous one first so
  // returning to a chapter replays it from its natural layout.
  const stopChapter = useCallback(() => {
    chapterMotionRef.current?.revert();
    chapterMotionRef.current = null;
  }, []);

  const playChapter = useCallback(() => {
    stopChapter();
    if (!isOpenRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const slide = sliderRef.current?.el.querySelector<HTMLElement>(
      '.swiper > .swiper-wrapper > .swiper-slide-active .swiper-slide-active',
    );
    if (slide) chapterMotionRef.current = animateChapter(slide);
  }, [stopChapter]);

  const activeProjectIndex = () => {
    const wrapper = sliderRef.current?.el.querySelector(':scope > .swiper > .swiper-wrapper');
    const active = wrapper?.querySelector(':scope > .swiper-slide-active');
    return wrapper && active ? Array.from(wrapper.children).indexOf(active) : -1;
  };

  const open = useCallback((index: number, { instant = false }: { instant?: boolean } = {}) => {
    const slider = sliderRef.current;
    if (!slider) return null;

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    isOpenRef.current = true;
    pausedRef.current = false;
    resetEndCard();

    slider.el.removeAttribute('inert');
    slider.el.classList.remove('stories-slider-out');
    slider.el.classList.toggle('stories-slider-instant', instant);
    slider.el.classList.add('stories-slider-in');
    slider.enable();
    slider.slideTo(index, 0);
    lenisRef.current?.stop();
    document.documentElement.classList.add('story-open');

    requestAnimationFrame(() => {
      activeSlide()?.querySelector<HTMLElement>('.stories-slider-close-button')?.focus({ preventScroll: true });
    });
    // Synchronous, so the first frame shown is already the entrance's start.
    playChapter();
    return activeSlide();
  }, [playChapter]);

  const close = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider || !isOpenRef.current) return;
    isOpenRef.current = false;

    slider.disable();
    // Must run before the viewer hides, so whatever covers the exit is in place first.
    const handedOff = onReturnRef.current?.(activeProjectIndex()) ?? false;
    if (handedOff) {
      slider.el.classList.remove('stories-slider-in', 'stories-slider-out', 'stories-slider-instant');
    } else {
      slider.el.classList.add('stories-slider-out');
    }
    slider.el.setAttribute('inert', '');
    lenisRef.current?.start();
    document.documentElement.classList.remove('story-open');
    resetEndCard();
    stopChapter();

    if (handedOff) return;
    returnFocusRef.current?.focus({ preventScroll: true });
    onCloseRef.current?.();
  }, [stopChapter]);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  // Every chapter has its own close button, so moving on (arrows, taps or
  // autoplay) would leave focus on a button in a now-hidden slide. Carry it
  // to the same button in the chapter that's showing.
  const handleIndexesChange = useCallback(() => {
    resetEndCard();
    playChapter();
    if (!isOpenRef.current) return;
    const slide = activeSlide();
    const focused = document.activeElement;
    if (!slide || !focused || slide.contains(focused)) return;
    if (!sliderRef.current?.el.contains(focused)) return;
    slide.querySelector<HTMLElement>('.stories-slider-close-button')?.focus({ preventScroll: true });
  }, [playChapter]);

  // The last chapter's time is up and the story waits for the visitor:
  // turn it into an end card. The copy glides from the bottom to the middle
  // of the frame and the pattern fades out behind it (it would otherwise
  // sit under the text), putting "Start a similar project" centre stage.
  const handleComplete = useCallback(() => {
    const slide = activeSlide();
    const content = slide?.querySelector<HTMLElement>('.story-slide');
    if (!isOpenRef.current || !slide || !content || slide.hasAttribute('data-complete')) return;
    const items = Array.from(content.children) as HTMLElement[];
    if (!items.length) return;

    const frame = slide.getBoundingClientRect();
    const top = items[0].getBoundingClientRect().top;
    const bottom = items[items.length - 1].getBoundingClientRect().bottom;
    const shift = frame.top + frame.height / 2 - (top + bottom) / 2;

    slide.setAttribute('data-complete', '');
    const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endCardRef.current = gsap.timeline().to(items, {
      y: Math.min(0, shift),
      duration: instant ? 0 : 1.1,
      ease: 'expo.inOut',
      // Top line leads, so lines briefly spread apart rather than overlap.
      stagger: instant ? 0 : 0.05,
    });
  }, []);

  // Stable callbacks: StoriesSlider re-creates the underlying slider when
  // these change identity.
  const handleInstance = useCallback((instance: StoriesSliderInstance) => {
    sliderRef.current = instance;
    instance.el.setAttribute('inert', '');
  }, []);

  // Finish the close animation, then fully reset the classes.
  useEffect(() => {
    const el = sliderRef.current?.el;
    if (!el) return;
    const onAnimationEnd = () => {
      if (el.classList.contains('stories-slider-out')) {
        el.classList.remove('stories-slider-in', 'stories-slider-out', 'stories-slider-instant');
      }
    };
    el.addEventListener('animationend', onAnimationEnd);
    return () => el.removeEventListener('animationend', onAnimationEnd);
  }, []);

  // Keyboard: arrows move between chapters, Space pauses, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpenRef.current) return;
      const slide = activeSlide();
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowRight':
          e.preventDefault();
          slide?.querySelector<HTMLElement>('.stories-slider-button-next')?.click();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          slide?.querySelector<HTMLElement>('.stories-slider-button-prev')?.click();
          break;
        case ' ': {
          // Let Space activate a focused button (close / call to action).
          const target = e.target as HTMLElement;
          if (target.closest('button, a')) return;
          e.preventDefault();
          const slider = sliderRef.current;
          if (!slider) return;
          if (pausedRef.current) slider.resume();
          else slider.pause(true);
          pausedRef.current = !pausedRef.current;
          break;
        }
        case 'Tab': {
          // Keep focus inside the dialog: only the active story is reachable.
          const focusables = Array.from(
            slide?.querySelectorAll<HTMLElement>('button, a[href], video[controls]') ?? [],
          );
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          } else if (!slide?.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Never leave the page scroll-locked if we unmount while open.
  useEffect(
    () => () => {
      if (isOpenRef.current) {
        lenisRef.current?.start();
        document.documentElement.classList.remove('story-open');
      }
    },
    [],
  );

  return (
    <StoriesSlider
      Swiper={Swiper}
      EffectCube={EffectCube}
      enabled={false}
      autoplayDuration={SLIDE_DURATION}
      // One project per viewing: its last chapter is the call to action, and
      // the story stops there (open until closed) rather than moving on.
      lockStory
      onProjectsSlider={handleInstance}
      onSlidesIndexesChange={handleIndexesChange}
      onComplete={handleComplete}
      onEnd={close}
      role="dialog"
      aria-modal="true"
      aria-label="Project story"
      aria-describedby="story-instructions"
    >
      {projects.map((project) => (
        <Stories key={project.id}>
          {project.slides.map((slide, storyIndex) => (
            <Story
              key={slide.id}
              title={project.title}
              category={project.category}
              accentColor={project.accentColor}
              pattern={patternStyle(project)}
              chapter={storyIndex}
              duration={slide.media?.type === 'video' ? VIDEO_SLIDE_DURATION : SLIDE_DURATION}
              onClose={close}
            >
              <SlideRenderer
                slide={slide}
                project={project}
                chapter={storyIndex + 1}
                chapters={project.slides.length}
              />
            </Story>
          ))}
        </Stories>
      ))}
    </StoriesSlider>
  );
});

ProjectsSlider.displayName = 'ProjectsSlider';

export default ProjectsSlider;
