'use client';

import React, { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import Swiper from 'swiper';
import { EffectCube } from 'swiper/modules';
import { StoriesSlider, Stories, Story } from '@/lib/swiper';
import { ProjectStory, ProjectSlide } from '@/data/projects';
import { SlideRenderer } from './SlideRenderer';

import 'swiper/css';
import 'swiper/css/effect-cube';
import '@/lib/swiper/stories-slide.css';

interface StoriesSliderInstance {
  el: HTMLElement;
  enable: () => void;
  disable: () => void;
  slideTo: (index: number, speed?: number) => void;
}

export interface StorySliderHandle {
  open: (index: number) => void;
  close: () => void;
}

interface StorySliderProps {
  projects: ProjectStory[]
}


const ProjectsSlider = forwardRef<StorySliderHandle, StorySliderProps>(
  ({ projects }, ref) => {
    const sliderRef = useRef<StoriesSliderInstance | null>(null);

    const open = useCallback((index: number) => {
      const slider = sliderRef.current;
      if (!slider) return;

      slider.el.classList.add('stories-slider-in');
      slider.enable();
      slider.slideTo(index, 0);
    }, []);

    const close = useCallback(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      slider.disable();
      slider.el.classList.add('stories-slider-out');
    }, []);

    // expose public API
    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    // animation cleanup
    useEffect(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const handleAnimationEnd = () => {
        if (slider.el.classList.contains('stories-slider-out')) {
          slider.el.classList.remove('stories-slider-in');
          slider.el.classList.remove('stories-slider-out');
        }
      };

      slider.el.addEventListener('animationend', handleAnimationEnd);
      return () => {
        slider.el.removeEventListener('animationend', handleAnimationEnd);
      };
    }, []);

  return (
    <>
      <StoriesSlider
        Swiper={Swiper}
        EffectCube={EffectCube}
        enabled={false}
        autoplayDuration={5000}
        onProjectsSlider={(instance: StoriesSliderInstance) => {
          sliderRef.current = instance;
        }}
        onSlidesIndexesChange={(mainIndex, subIndex) => {
          console.log({mainIndex, subIndex})
        }}
        onEnd={close}
      >
        {projects && projects.map((projectSlides, projectSlidesIndex) => (
          <Stories key={projectSlidesIndex}>
            {projectSlides.slides.map(function(slide: ProjectSlide, storyIndex: number) {
              slide.accentColor = projectSlides.accentColor;
              slide.index = storyIndex;
              slide.skills = projectSlides.skills;
              return (
                <Story
                  key={storyIndex}
                  slideIndex={storyIndex}
                  title={projectSlides.title}
                  subtitle={projectSlides.shortTagline}
                  accentColor={projectSlides.accentColor}
                  category={projectSlides.category}
                  duration={600000}
                  closeButton
                  onClose={close}
                >
                  <SlideRenderer slide={slide} />

                </Story>
              );
            })}
          </Stories>
        ))}
      </StoriesSlider>
    </>
  )
}
);

ProjectsSlider.displayName = 'ProjectsSlider';

export default ProjectsSlider;