import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import WorkIndex from "@/components/home/WorkIndex";
import CtaBand from "@/components/CtaBand";
import CursorLink from "@/components/TargetCursor/CursorLink";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: { absolute: "Jkrafts — Websites and web systems, crafted to last" },
  description:
    "Jkrafts designs and builds websites, web apps and business systems that look sharp and solve real problems.",
  openGraph: {
    title: "Design and craft modern, high-performance web experiences",
    description:
      "Jkrafts designs and builds websites, web apps and business systems that look sharp and solve real problems.",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
  },
};

const principles = [
  {
    title: "Custom crafted",
    body: "Exceptional craftsmanship in every product. Each build starts from your brand and your goals, not a template.",
  },
  {
    title: "Strategic",
    body: "Every decision starts from what the business needs: your goals, your constraints, and the people who will use it.",
  },
  {
    title: "Built to scale",
    body: "Every component is designed for reliability and longevity, so the system keeps up as you grow.",
  },
];

export default function Home() {
  return (
    <main id="main">
      <Hero />

      <section id="intro" aria-label="About the practice" className="shell section">
        <div className="grid-12">
          <div className="col-span-4 md:col-span-11 lg:col-span-10">
            <Statement>
              At Jkrafts, I design and develop digital experiences that don’t just look good — they solve
              real business problems. From sleek websites to robust web applications, everything I build is
              intentional, performant and future-ready.
            </Statement>
          </div>
        </div>

        <ul role="list" className="grid-12 mt-[clamp(4rem,9vw,8rem)] gap-y-10">
          {principles.map((p) => (
            <li key={p.title} className="col-span-4 border-t border-line-strong pt-6">
              <h3 className="t-h3 flex items-center gap-3">
                <span className="mark" aria-hidden="true" />
                {p.title}
              </h3>
              <p className="mt-3 max-w-[36ch] text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="work" aria-labelledby="work-title" className="shell pb-[var(--section)]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-14">
          <h2 id="work-title" className="t-h2">
            Selected work
          </h2>
          <CursorLink href="/projects" className="link text-lg">
            Browse the project stories
          </CursorLink>
        </div>
        <WorkIndex projects={projects} />
      </section>

      <section aria-labelledby="bio-title" className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-8 border-t border-line-strong pt-10 md:pt-14">
          <h2 id="bio-title" className="t-h2 col-span-4 md:col-span-5">
            The mind behind Jkrafts
          </h2>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-6 md:col-start-7">
            <p className="t-lead">
              I am a web developer focused on crafting reliable, scalable, and thoughtful digital
              solutions.
            </p>
            <p className="measure text-muted">
              I work closely with clients to understand their goals and translate them into systems that
              support real growth.
            </p>
            <div>
              <CursorLink href="/about" className="btn btn-outline">
                More about Jkrafts
              </CursorLink>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
