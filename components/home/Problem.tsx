import Statement from "@/components/home/Statement";
import FeatureFigure from "@/components/home/FeatureFigure";
import { features, pains } from "@/data/home";

/**
 * The problem the visitor has, what it is costing them, and the better way:
 * the position statement, then what that means feature by feature.
 */
export default function Problem() {
  return (
    <section aria-labelledby="problem-title" className="shell pb-[var(--section)]">
      <div className="grid-12 gap-y-10 border-t border-line-strong pt-10 md:pt-14">
        <h2 id="problem-title" className="t-h2 col-span-4 md:col-span-5">
          Sound familiar?
        </h2>
        <ul role="list" className="col-span-4 grid gap-x-8 gap-y-10 sm:grid-cols-2 md:col-span-7 md:col-start-6">
          {pains.map((p) => (
            <li key={p.title}>
              <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 text-muted">{p.body}</p>
            </li>
          ))}
        </ul>

        <p className="t-lead col-span-4 mt-6 max-w-[40ch] md:col-span-7 md:col-start-6">
          Each month it stays this way costs you enquiries you never hear about, hours your team
          won’t get back, and customers who quietly go elsewhere.
        </p>
      </div>

      <div className="grid-12 mt-[clamp(5rem,10vw,9rem)]">
        <div className="col-span-4 md:col-span-11 lg:col-span-10">
          <Statement>
            There’s a better way. Jkrafts designs and builds websites and systems around how your
            business actually works: done properly once, delivered when promised, and looked after
            for the long run.
          </Statement>
        </div>
      </div>

      <h3 className="sr-only">What you get</h3>
      <ul role="list" className="mt-[clamp(4rem,8vw,7rem)]">
        {features.map((f) => (
          <li key={f.title} className="feature-row grid-12 items-center gap-y-5 border-t border-line py-8 md:py-10">
            <div className="col-span-2 md:col-span-2">
              <FeatureFigure kind={f.figure} />
            </div>
            <h4 className="t-h3 col-span-4 md:col-span-4 md:col-start-4">{f.title}</h4>
            <p className="col-span-4 max-w-[44ch] text-muted md:col-span-5 md:col-start-8">{f.benefit}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
