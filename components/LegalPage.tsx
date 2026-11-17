import type { ReactNode } from "react";
import PageIntro from "@/components/PageIntro";
import "./LegalPage.css";

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Shared layout for the policy pages (privacy, cookies, terms, security,
 * licences): the title, when it last changed, a contents list that stays
 * in view on wide screens, then the sections.
 */
export default function LegalPage({
  title,
  lead,
  updated,
  sections,
}: {
  title: string;
  lead: string;
  /** Human-readable date, e.g. "16 November 2026". */
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main id="main">
      <PageIntro title={title} lead={lead} />

      <div className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-10 border-t border-line-strong pt-10 md:pt-14">
          <nav aria-label="On this page" className="col-span-4 md:col-span-4 lg:col-span-3">
            <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
              <p className="t-small text-muted">Last updated {updated}</p>
              <ol className="mt-6 hidden flex-col gap-1 md:flex">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="inline-flex min-h-9 items-center hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="legal col-span-4 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
                <h2 id={`${s.id}-title`} className="t-h3">
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
