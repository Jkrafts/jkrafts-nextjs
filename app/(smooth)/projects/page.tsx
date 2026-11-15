import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import ProjectsRoot from "@/components/Projects/ProjectsRoot";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore selected projects by Jkrafts showcasing web development, UI engineering, and creative problem solving.",
  openGraph: {
    title: "Selected projects showcasing strategy, craft, and execution",
    description:
      "Explore selected projects by Jkrafts showcasing web development, UI engineering, and creative problem solving.",
    images: [{ url: "/og/projects.png", width: 1200, height: 630 }],
  },
};

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
