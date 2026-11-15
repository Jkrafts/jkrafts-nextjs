'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Navigation, Scrollbar } from 'swiper/modules';
import { getInitials, patternStyle, projects } from '@/data/projects';
import ProjectsSlider, { StorySliderHandle } from '@/components/Projects/ProjectsSlider';
import Icon from '@/components/Icon';
import {
  completeStoryEnter,
  hasIncomingStory,
  playStoryReturn,
  prefersReducedMotion,
} from '@/lib/storyTransition';

import 'swiper/css';
import './ProjectsRoot.css';

const ProjectsRoot = () => {
  const storyRef = useRef<StorySliderHandle | null>(null);
  const router = useRouter();
  // Set when the story was entered from the home page's work index, so
  // closing it returns there (see lib/storyTransition).
  const enteredFromHomeRef = useRef(false);

  // Deep link: /projects?story=<id> opens that story straight away (used by
  // the work index on the home page).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('story');
    if (!id) return;
    const index = projects.findIndex((p) => p.id === id);
    if (index < 0) return;

    if (hasIncomingStory(id)) {
      enteredFromHomeRef.current = true;
      completeStoryEnter(id, () => storyRef.current?.open(index, { instant: true }) ?? null);
    } else {
      storyRef.current?.open(index);
    }
  }, []);

  // A story entered from the home page closes back into its row there.
  const handleReturn = useCallback(
    (projectIndex: number) => {
      if (!enteredFromHomeRef.current || prefersReducedMotion()) return false;
      const project = projects[projectIndex];
      if (!project) return false;
      enteredFromHomeRef.current = false;
      playStoryReturn(project.id, project.accentColor, patternStyle(project), () => {
        // Next ignores popstate into history entries it didn't create (null
        // state, e.g. a hash typed into the address bar), leaving this page
        // rendered under the previous URL. Make it render that URL.
        window.addEventListener(
          'popstate',
          (e) => {
            if (!e.state) router.replace(location.pathname + location.search + location.hash, { scroll: false });
          },
          { once: true },
        );
        router.back();
      });
      return true;
    },
    [router],
  );

  // Drop the query string once the story is closed so a refresh doesn't
  // reopen it.
  const handleClose = useCallback(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('story')) {
      url.searchParams.delete('story');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }, []);

  return (
    <section aria-labelledby="stories-title" className="overflow-x-clip pb-[var(--section)]">
      <div className="shell">
        <div className="mb-8 flex items-end justify-between gap-6 border-t border-line-strong pt-6">
          <div>
            <h2 id="stories-title" className="t-h3">
              {projects.length} projects
            </h2>
            <p className="mt-1 text-muted">Select one to play its story.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="projects-nav projects-prev" aria-label="Previous projects">
              <Icon name="chevron-left" size={22} />
            </button>
            <button type="button" className="projects-nav projects-next" aria-label="Next projects">
              <Icon name="chevron-right" size={22} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Scrollbar, Keyboard, A11y]}
          // Mirrored in ProjectsRoot.css for the first paint, before Swiper runs.
          slidesPerView={1.2}
          spaceBetween={16}
          breakpoints={{
            560: { slidesPerView: 2.2, spaceBetween: 16 },
            900: { slidesPerView: 3.2, spaceBetween: 20 },
            1280: { slidesPerView: 4.2, spaceBetween: 24 },
          }}
          navigation={{ prevEl: '.projects-prev', nextEl: '.projects-next' }}
          scrollbar={{ el: '.projects-scrollbar', draggable: true }}
          keyboard={{ enabled: true, onlyInViewport: true }}
          a11y={{ enabled: true, containerMessage: 'Project stories', slideRole: 'listitem' }}
          watchSlidesProgress
          className="projects-swiper"
        >
          {projects.map((project, index) => (
            <SwiperSlide key={project.id} className="!h-auto">
              <button
                type="button"
                className="story-tile"
                style={{ '--accent': project.accentColor, ...patternStyle(project) } as React.CSSProperties}
                onClick={() => storyRef.current?.open(index)}
                aria-haspopup="dialog"
              >
                <span className="story-tile-bars" aria-hidden="true">
                  {project.slides.map((s) => (
                    <span key={s.id} />
                  ))}
                </span>
                <span className="story-tile-category t-small">{project.category}</span>
                <span className="story-tile-monogram" aria-hidden="true">
                  {getInitials(project.title)}
                </span>
                <span className="story-tile-body">
                  <span className="story-tile-title">{project.title}</span>
                  <span className="story-tile-tagline">{project.shortTagline}</span>
                  <span className="story-tile-cta">View story</span>
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="projects-scrollbar" />
      </div>

      <ProjectsSlider ref={storyRef} projects={projects} onClose={handleClose} onReturn={handleReturn} />
    </section>
  );
};

export default ProjectsRoot;
