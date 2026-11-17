import CursorLink from "@/components/TargetCursor/CursorLink";
import { faqs } from "@/data/home";

/**
 * Common questions as native disclosures: keyboard and screen-reader
 * support come with <details>, and the answers stay findable with
 * find-in-page. The shared `name` makes them an exclusive accordion:
 * opening one closes the one that was open.
 */
export default function Faq() {
  return (
    <section aria-labelledby="faq-title" className="shell pb-[var(--section)]">
      <div className="grid-12 gap-y-10 border-t border-line-strong pt-10 md:pt-14">
        <div className="col-span-4 md:col-span-5">
          <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
            <h2 id="faq-title" className="t-h2">
              Questions, answered
            </h2>
            <p className="mt-6 max-w-[32ch] text-muted">
              Something else on your mind?{" "}
              <CursorLink href="/contact" className="link text-ink">
                Ask me directly
              </CursorLink>
              . I reply within one working day.
            </p>
          </div>
        </div>

        <div className="col-span-4 md:col-span-7 md:col-start-6">
          {faqs.map((f) => (
            <details key={f.q} name="faq" className="faq">
              <summary>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <p className="faq-answer measure text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
