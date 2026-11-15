import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import ContactForm from "@/components/ContactForm";
import Icon, { type IconName } from "@/components/Icon";
import { contact, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Jkrafts to discuss your project, collaboration opportunities, or creative ideas.",
  openGraph: {
    title: "Get in touch to discuss ideas, collaborations, or new projects",
    description:
      "Get in touch with Jkrafts to discuss your project, collaboration opportunities, or creative ideas.",
    images: [{ url: "/og/contact.png", width: 1200, height: 630 }],
  },
};

type Channel = { label: string; value: string; href: string; icon: IconName; external?: boolean };

const channels: Channel[] = [
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, icon: "email" },
  { label: "WhatsApp", value: contact.phoneDisplay, href: contact.whatsapp, icon: "whatsapp", external: true },
  ...socials
    .filter((s) => s.icon === "linkedin" || s.icon === "facebook")
    .map((s) => ({ label: s.label, value: s.handle, href: s.href, icon: s.icon, external: true })),
];

export default function ContactPage() {
  return (
    <main id="main">
      <PageIntro
        title="Let’s build something remarkable."
        lead="Available for new projects, collaborations, and long-term work."
      />

      <div className="shell pb-[var(--section)]">
        <div className="grid-12 gap-y-14 border-t border-line-strong pt-10 md:pt-14">
          <section aria-labelledby="channels-title" className="col-span-4 md:col-span-12 lg:col-span-4">
            <h2 id="channels-title" className="t-h3">
              Prefer email or a quick call?
            </h2>
            <p className="mt-3 text-muted">Reach out through any channel below.</p>

            <ul role="list" className="mt-8 border-t border-line">
              {channels.map((c) => (
                <li key={c.label} className="border-b border-line">
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex min-h-16 items-center gap-4 py-4"
                  >
                    <Icon name={c.icon} size={22} className="flex-none text-muted transition-colors group-hover:text-violet" />
                    <span className="flex min-w-0 flex-col">
                      <span className="t-small text-muted">{c.label}</span>
                      <span className="truncate text-lg group-hover:underline">{c.value}</span>
                    </span>
                    {c.external && <span className="sr-only">(opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="project-form"
            aria-labelledby="form-title"
            className="col-span-4 scroll-mt-[calc(var(--header-h)+1.5rem)] md:col-span-12 lg:col-span-7 lg:col-start-6"
          >
            <h2 id="form-title" className="t-h3 max-w-[30ch]">
              Tell me a bit about your project and I’ll get back to you shortly.
            </h2>
            <p className="mt-3 text-muted">All fields are required.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
