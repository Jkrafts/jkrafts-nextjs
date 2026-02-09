import ContactForm from "@/components/ContactForm";
import BioTeaser from "@/components/Home/BioTeaser";
import Hero from "@/components/Home/Hero";
import { IntroText } from "@/components/Home/IntroText";
import ScrollFlipCards from "@/components/ScrollFlipCards";
import { ScrollStackContainer } from "@/components/ScrollStack/ScrollStackContainer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JKrafts — Creative Developer & Designer",
  description:
    "JKrafts is a creative web developer crafting modern, high-performance digital experiences with clean design and thoughtful interactions.",
  openGraph: {
    title: "Designing and building modern, high-performance web experiences",
    description:
      "JKrafts is a creative web developer crafting modern, high-performance digital experiences with clean design and thoughtful interactions.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Home() {
  return (
    <main>
      <section id="hero">
        <Hero />
      </section>

      <section id="intro">
        <IntroText />
      </section>

      <section id="projects">
        <ScrollStackContainer />
      </section>

      <section id="bio-teaser">
        <BioTeaser />
      </section>

      <section id="pillars">
        <ScrollFlipCards />
      </section>

      <section
        id="contact"
        className="p-4 mt-10 md:mt-12 md:h-screen flex items-center justify-center"
      >
        <ContactForm />
      </section>
    </main>
  );
}
