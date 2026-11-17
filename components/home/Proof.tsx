import CursorLink from "@/components/TargetCursor/CursorLink";
import WorkIndex from "@/components/home/WorkIndex";
import { patternStyle, projects } from "@/data/projects";
import { testimonials } from "@/data/home";

/**
 * Social proof: what clients said, the change they measured (painted in the
 * project's own colour and pattern, as on its story), then every project.
 */
export default function Proof() {
  return (
    <section id="work" aria-labelledby="proof-title" className="shell section">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-16">
        <h2 id="proof-title" className="t-h2 max-w-[18ch]">
          Results clients have seen
        </h2>
        <CursorLink href="/projects" className="link text-lg">
          Browse the project stories
        </CursorLink>
      </div>

      <ul role="list" className="grid-12 gap-y-14">
        {testimonials.map((t) => {
          const project = projects.find((p) => p.id === t.projectId);
          if (!project) return null;
          return (
            <li key={t.projectId} className="col-span-4">
              <figure className="flex h-full flex-col">
                <div
                  className="proof-result"
                  style={{ "--accent": project.accentColor, ...patternStyle(project) } as React.CSSProperties}
                >
                  <p>
                    <span className="proof-figure">{t.result.figure}</span>
                    <span className="mt-2 block max-w-[20ch]">{t.result.label}</span>
                  </p>
                  <p className="t-small proof-project">{project.title}</p>
                </div>
                <blockquote className="mt-7 text-lg leading-snug">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-5 t-small text-muted">
                  <span className="font-medium text-ink">{t.name}</span>
                  <br />
                  {t.role}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>

      <h3 className="t-h3 mt-[clamp(5rem,9vw,8rem)] mb-6 md:mb-8">Selected work</h3>
      <WorkIndex projects={projects} />
    </section>
  );
}
