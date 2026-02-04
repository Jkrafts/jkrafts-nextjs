import BeyondCode from "@/components/About/BeyondCode";
import Hero from "@/components/About/Hero";
import HowWeWork from "@/components/About/HowWeWork";
import IntroText from "@/components/About/IntroText";

export default function About() {

  return (
    <main id="about">
      <section>
        <Hero />
      </section>

      <section>
        <IntroText />
      </section>

      <section>
        <HowWeWork />
      </section>

      <section>
        <BeyondCode />
      </section>

    </main>
  )
}
