import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Jkrafts, a creative developer focused on building elegant, user-centric digital products.",
  openGraph: {
    title: "Learn about the process, values, and mindset behind my work",
    description:
      "Learn more about Jkrafts, a creative developer focused on building elegant, user-centric digital products.",
    images: [{ url: "/og/about.png", width: 1200, height: 630 }],
  },
};

const steps = [
  { name: "Discover", body: "Understand your goals and constraints." },
  { name: "Define", body: "Shape the right solution." },
  { name: "Design", body: "Clean, usable, intentional interfaces." },
  { name: "Build", body: "Scalable, secure, maintainable code." },
  { name: "Refine", body: "Improve, optimize, and grow." },
];

const values = ["Problem-solving", "Systems thinking", "Automation", "Learning", "Craftsmanship"];

export default function About() {
  return (
    <main id="main">
      <PageIntro
        title="Redefining the way brands exist online."
        lead="Developer. Problem-solver. Digital craftsman."
      />

      <section aria-labelledby="story-title" className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-8 border-t border-line-strong pt-10 md:pt-14">
          <h2 id="story-title" className="t-h2 col-span-4 md:col-span-5">
            The story behind Jkrafts
          </h2>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-6 md:col-start-7">
            <p className="t-lead">
              Jkrafts was born from a simple idea: the web should work as well as it looks.
            </p>
            <p className="measure text-muted">
              Over time, that idea evolved into a practice focused on building purposeful digital solutions
              that support businesses, not just decorate them.
            </p>
            <p className="measure text-muted">
              I believe in clean code, thoughtful design, and long-term thinking. Every project is approached
              with care, curiosity, and attention to detail.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="process-title" className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-10 border-t border-line-strong pt-10 md:pt-14">
          <div className="col-span-4 md:col-span-5">
            <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
              <h2 id="process-title" className="t-h2">
                How I work
              </h2>
              <p className="mt-6 max-w-[34ch] text-muted">
                The process is designed to ensure quality and efficiency at every step.
              </p>
            </div>
          </div>

          <ol className="col-span-4 md:col-span-6 md:col-start-7">
            {steps.map((step, i) => (
              <li
                key={step.name}
                className="grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-b border-line py-7 first:pt-0 md:grid-cols-[4.5rem_1fr] md:py-9"
              >
                <span className="t-small tabular-nums text-muted" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="t-h2">{step.name}</h3>
                  <p className="mt-3 text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="beyond-title" className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-8 border-t border-line-strong pt-10 md:pt-14">
          <h2 id="beyond-title" className="t-h2 col-span-4 md:col-span-5">
            Beyond code
          </h2>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-6 md:col-start-7">
            <p className="t-lead">Great software is about more than just code.</p>
            <p className="measure text-muted">
              It’s about creating meaningful experiences that resonate with users and drive real-world impact.
              I focus on understanding your vision and translating it into digital solutions that not only
              function flawlessly but also inspire and engage.
            </p>
          </div>

          <div className="col-span-4 mt-8 md:col-span-12 md:mt-14">
            <h3 className="t-small mb-5 text-muted">What drives the work</h3>
            <ul role="list" className="flex flex-wrap gap-x-10 gap-y-4">
              {values.map((v) => (
                <li key={v} className="t-h2 flex items-center gap-4">
                  <span className="mark text-[0.5em]" aria-hidden="true" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
