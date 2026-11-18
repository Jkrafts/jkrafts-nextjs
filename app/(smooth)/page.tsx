import type { Metadata } from "next";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import Proof from "@/components/home/Proof";
import Problem from "@/components/home/Problem";
import HowItWorks from "@/components/home/HowItWorks";
import Faq from "@/components/home/Faq";
import CtaBand from "@/components/CtaBand";
import "@/components/home/Home.css";

export const metadata: Metadata = pageMetadata({
  title: "Jkrafts | Websites and business systems, built properly",
  absoluteTitle: true,
  socialTitle: "Websites and business systems, built properly the first time",
  description:
    "Jkrafts designs and builds websites, web apps and business systems that bring in enquiries and save your team hours.",
  path: "/",
});

export default function Home() {
  return (
    <main id="main">
      <JsonLd data={organizationJsonLd()} />
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
