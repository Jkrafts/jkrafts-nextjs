import ContactForm from "@/components/ContactForm";
import BioTeaser from "@/components/Home/BioTeaser";
import Hero from "@/components/Home/Hero";
import { IntroText } from "@/components/Home/IntroText";
import ScrollFlipCards from "@/components/ScrollFlipCards";
import { ScrollStackContainer } from "@/components/ScrollStack/ScrollStackContainer";

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
