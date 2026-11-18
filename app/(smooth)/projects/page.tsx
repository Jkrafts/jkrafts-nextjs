import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageIntro from "@/components/PageIntro";
import ProjectsRoot from "@/components/Projects/ProjectsRoot";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  socialTitle: "Project stories from Jkrafts",
  description:
    "Project stories from Jkrafts: bar and retail point-of-sale systems, a catering website and SaaS work. The challenge, the build and the result.",
  path: "/projects",
  image: "/og/projects.png",
});

export default function ProjectsPage() {
  return (
    <main id="main">
      <PageIntro
        title="Project stories"
        lead="Each project is told as a short story: the challenge, the craft, the stack and the result."
      />
      <ProjectsRoot />
      <CtaBand />
    </main>
  );
}
