import type { Metadata } from "next";
import ProjectsRoot from "@/components/Projects/ProjectsRoot";

export const metadata: Metadata = {
  title: "Projects — JKrafts",
  description:
    "Explore selected projects by JKrafts showcasing web development, UI engineering, and creative problem solving.",
  openGraph: {
    title: "Selected projects showcasing strategy, craft, and execution",
    description:
      "Explore selected projects by JKrafts showcasing web development, UI engineering, and creative problem solving.",
    images: [
      {
        url: "/og/projects.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

const Page: React.FC = () => {
  return <ProjectsRoot />;
};

export default Page;
