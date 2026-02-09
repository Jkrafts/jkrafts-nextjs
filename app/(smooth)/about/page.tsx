import BeyondCode from "@/components/About/BeyondCode";
import Hero from "@/components/About/Hero";
import HowWeWork from "@/components/About/HowWeWork";
import IntroText from "@/components/About/IntroText";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — JKrafts",
  description:
    "Learn more about JKrafts, a creative developer focused on building elegant, user-centric digital products.",
  openGraph: {
    title: "About — JKrafts",
    description:
      "Learn more about JKrafts, a creative developer focused on building elegant, user-centric digital products.",
    images: [
      {
        url: "/og/about.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

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
