import ContactPage from "@/components/Contact/ContactPage";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — JKrafts",
  description:
    "Get in touch with JKrafts to discuss your project, collaboration opportunities, or creative ideas.",
  openGraph: {
    title: "Get in touch to discuss ideas, collaborations, or new projects",
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
    <ContactPage />
    </>
  );
}

export default page;