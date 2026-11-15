import { getInitials, type ProjectSlide, type ProjectStory } from '@/data/projects';
import CursorLink from '@/components/TargetCursor/CursorLink';

type SlideProps = {
  slide: ProjectSlide;
  project: ProjectStory;
  chapter: number;
  chapters: number;
};

/** Chapter label shared by every slide, e.g. "2 of 5  The challenge". */
function Chapter({ chapter, chapters, title }: { chapter: number; chapters: number; title?: string }) {
  return (
    <p className="story-chapter">
      <span className="story-chapter-count">
        {chapter} of {chapters}
      </span>
      {title && <span>{title}</span>}
    </p>
  );
}

export function SlideRenderer({ slide, project, chapter, chapters }: SlideProps) {
  switch (slide.type) {
    case 'cover':
      return (
        <div className="story-slide story-slide-cover" data-chapter="cover">
          <span className="story-monogram" aria-hidden="true">
            {getInitials(project.title)}
          </span>
          <p className="story-chapter">{project.category}</p>
          <h3 className="story-cover-title">{slide.title ?? project.title}</h3>
          {slide.body && <p className="story-lead">{slide.body}</p>}
        </div>
      );

    case 'challenge':
      return (
        <div className="story-slide" data-chapter="challenge">
          <Chapter chapter={chapter} chapters={chapters} title={slide.title} />
          <p className="story-statement">{slide.body}</p>
        </div>
      );

    case 'craft':
      return (
        <div className="story-slide" data-chapter="craft">
          <Chapter chapter={chapter} chapters={chapters} title={slide.title} />
          {slide.bullets && (
            <ul className="story-list">
              {slide.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'process':
      return (
        <div className="story-slide" data-chapter="process">
          <Chapter chapter={chapter} chapters={chapters} title={slide.title} />
          {slide.media?.type === 'video' ? (
            <video
              className="story-media"
              src={slide.media.src}
              muted
              playsInline
              preload="none"
              aria-label={`${project.title}: process recording`}
            />
          ) : (
            <ul className="story-tags" aria-label="Technologies">
              {project.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'result':
      return (
        <div className="story-slide" data-chapter="result">
          <Chapter chapter={chapter} chapters={chapters} title={slide.title} />
          <p className="story-statement">{slide.body}</p>
          <div className="story-cta-block">
            <p className="story-lead">Need something like this? Tell me about your project.</p>
            <CursorLink href={`/contact?project=${project.id}#project-form`} className="story-cta">
              Start a similar project
            </CursorLink>
          </div>
        </div>
      );

    default:
      return null;
  }
}
