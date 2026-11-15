'use client';

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CursorLink from "@/components/TargetCursor/CursorLink";
import { patternStyle, type ProjectStory } from "@/data/projects";
import { useLenis } from "@/providers/LenisProvider";
import { completeStoryReturn, playStoryEnter, prefersReducedMotion } from "@/lib/storyTransition";
import "./WorkIndex.css";

/**
 * An index of projects. Each row opens that project's story on /projects.
 * On hover/focus the row floods with the project's own colour; selecting it
 * lifts that colour into the story frame (see lib/storyTransition), and
 * closing the story brings it back down into the row.
 */
export default function WorkIndex({ projects }: { projects: ProjectStory[] }) {
  const router = useRouter();
  const lenis = useLenis();
  const listRef = useRef<HTMLUListElement>(null);

  // Returning from a story entered from here: land back on its row.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    completeStoryReturn(
      (id) => list.querySelector<HTMLElement>(`[data-story="${CSS.escape(id)}"]`),
      (y) => {
        window.scrollTo(0, y);
        lenis?.scrollTo(y, { immediate: true, force: true });
      },
    );
    // Only on mount: a return is a one-off handover from the previous route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, project: ProjectStory) => {
    // Leave new-tab/window clicks and reduced motion to the plain link.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (prefersReducedMotion()) return;
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href")!;
    playStoryEnter(e.currentTarget, project.id, project.accentColor, patternStyle(project), () => router.push(href));
  };

  return (
    <ul ref={listRef} className="work-index" role="list">
      {projects.map((project) => (
        <li key={project.id}>
          <CursorLink
            href={`/projects?story=${project.id}`}
            className="work-row"
            data-story={project.id}
            onClick={(e) => handleClick(e, project)}
            style={{ "--accent": project.accentColor, ...patternStyle(project) } as React.CSSProperties}
          >
            <span className="work-row-fill" aria-hidden="true" />
            <span className="work-row-title t-h3">
              <span className="work-row-swatch" aria-hidden="true" />
              {project.title}
            </span>
            <span className="work-row-desc">
              {project.shortTagline}
              <span className="work-row-skills t-small">{project.skills.join(", ")}</span>
            </span>
            <span className="work-row-meta t-small">{project.category}</span>
          </CursorLink>
        </li>
      ))}
    </ul>
  );
}
