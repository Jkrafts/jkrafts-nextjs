import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import { ScrollStackContainer } from "@/components/ScrollStackContainer";

export default function Home() {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>
      
      <ScrollStackContainer />
    </>
  );
}
