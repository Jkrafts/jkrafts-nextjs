import CursorLink from "@/components/TargetCursor/CursorLink";
import { contact } from "@/lib/site";

/**
 * Closing call to action. The one inverted surface on a page: it marks the
 * end of the content and gives the next step a clear, single focus.
 */
export default function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-band text-band-ink">
      <div className="shell grid-12 gap-y-10 py-[clamp(5rem,10vw,9rem)]">
        <h2 id="cta-title" className="t-h1 col-span-4 md:col-span-10">
          Let&apos;s build something remarkable.
        </h2>
        <div className="col-span-4 flex flex-col gap-8 md:col-span-6 md:col-start-7">
          <p className="t-lead text-band-muted">
            Available for new projects, collaborations, and long-term work.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <CursorLink href="/contact" className="btn btn-band">
              Start a project
            </CursorLink>
            <a href={`mailto:${contact.email}`} className="link text-lg">
              {contact.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
