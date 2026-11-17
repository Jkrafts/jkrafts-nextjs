import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Proof from "@/components/home/Proof";
import Problem from "@/components/home/Problem";
import HowItWorks from "@/components/home/HowItWorks";
import Faq from "@/components/home/Faq";
import CtaBand from "@/components/CtaBand";
import "@/components/home/Home.css";

export const metadata: Metadata = {
  title: { absolute: "Jkrafts | Websites and business systems, built properly" },
  description:
    "Jkrafts designs and builds websites, web apps and business systems that look sharp and solve real problems.",
  openGraph: {
    title: "Websites and business systems, built properly the first time",
    description:
      "Jkrafts designs and builds websites, web apps and business systems that look sharp and solve real problems.",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Proof />
      <Problem />
      <HowItWorks />
      <Faq />
      <CtaBand
        title="Your next system, built properly."
        lead="Tell me what you’re working on. You’ll get a clear plan and an honest quote, with no obligation."
      />
    </main>
  );
}
