'use client';

import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import SectionText from "@/components/SectionText";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — JKrafts",
  description:
    "Get in touch with JKrafts to discuss your project, collaboration opportunities, or creative ideas.",
  openGraph: {
    title: "Contact — JKrafts",
    description:
      "Get in touch with JKrafts to discuss your project, collaboration opportunities, or creative ideas.",
    images: [
      {
        url: "/og/contact.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};


const page = () => {
  return (
    <>
      <section className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-text z-10">Let&apos;s build something remarkable</h1>

        <div>
          <p className="mt-4 lg:mt-8 text-lg md:text-2xl text-muted z-10 max-w-xl text-center">
            Available for new projects, collaborations, and long-term work.
          </p>
        </div>
      </section>

      <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>

      <section className=" max-w-4xl mx-auto">
        <SectionText>
          <SectionText.Heading>Get In Touch</SectionText.Heading>
          <SectionText.Paragraph>
            Prefer email or a quick call? Reach out through any channel below.

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-10 mb-20">
              <div>
                <Icon name="email" alt="Email Icon" size={48} />
                <h2 className="mt-4 text-2xl font-semibold text-text">Email</h2>
                <a href="mailto:info@jkrafts.com" className="cursor-target mt-2 text-blue-600 font-medium text-lg">info@jkrafts.com</a>
              </div>

              <div>
                <Icon name="whatsapp" alt="WhatsApp Icon" size={48} />
                <h2 className="mt-4 text-2xl font-semibold text-text">Phone</h2>
                <a href="https://wa.me/+447413049561" className="cursor-target mt-2 text-blue-600 font-medium text-lg">+44 7413 049561</a>
              </div>

              <div>
                <Icon name="facebook" alt="FaceBook Icon" size={48} />
                <h2 className="mt-4 text-2xl font-semibold text-text">FaceBook</h2>
                <a href="https://www.facebook.com/jkrafts7" className="cursor-target mt-2 text-lg text-blue-600">FB page</a>
              </div>

              <div>
                <Icon name="linkedin" alt="LinkedIn Icon" size={48} />
                <h2 className="mt-4 text-2xl font-semibold text-text">LinkedIn</h2>
                <a href="https://www.linkedin.com/in/joe-waithaka/" className="cursor-target mt-2 text-lg text-blue-600">LinkedIn profile</a>
              </div>

            </div>
          </SectionText.Paragraph>
        </SectionText>
      </section>

      <div className="w-full h-px bg-gray-300 dark:bg-gray-700"></div>

      <div className="pt-8 md:pt-12 space-y-8 md:space-y-12 px-4 md:px-8 lg:px-16 max-w-4xl mx-auto">
        
        <h3 className="font-instrument font-medium text-center text-xl md:text-2xl lg:text-4xl">Tell me a bit about your project and I&apos;ll get back to you shortly.</h3>

        <div>
          <ContactForm />
        </div>
        
      </div>
    </>
  );
}

export default page;