import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { contact } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Security",
  description: "How this site and the systems Jkrafts builds are kept secure, and how to report a vulnerability.",
  path: "/security",
});

const sections: LegalSection[] = [
  {
    id: "site",
    title: "This website",
    body: (
      <ul>
        <li>It is a static site served over HTTPS. There are no accounts, logins or stored passwords.</li>
        <li>The contact form is sent over an encrypted connection.</li>
        <li>Analytics scripts load only if you allow them.</li>
        <li>Dependencies are kept up to date, and an automated test suite covers the site’s behaviour.</li>
      </ul>
    ),
  },
  {
    id: "client-work",
    title: "Systems built for clients",
    body: (
      <>
        <p>Security is part of every build, not added at the end. As standard:</p>
        <ul>
          <li>Role-based access, so each person sees and changes only what their job needs.</li>
          <li>Passwords and PINs stored only as one-way hashes.</li>
          <li>API keys and other secrets encrypted at rest, never committed to code.</li>
          <li>Automated, scheduled backups.</li>
          <li>An audit trail of who changed what, where the system handles money or stock.</li>
          <li>Framework and package updates applied promptly during support.</li>
        </ul>
      </>
    ),
  },
  {
    id: "report",
    title: "Reporting a vulnerability",
    body: (
      <>
        <p>
          If you think you’ve found a security problem in this site or in a system Jkrafts built, email{" "}
          <a href={`mailto:${contact.email}?subject=Security%20report`}>{contact.email}</a> with
          “Security report” as the subject. Please include:
        </p>
        <ul>
          <li>what you found and where;</li>
          <li>the steps to reproduce it;</li>
          <li>what an attacker could do with it.</li>
        </ul>
        <p>
          You’ll get a reply within [5] working days, and updates until it is fixed. Please give a
          reasonable time to fix the problem before sharing it publicly.
        </p>
      </>
    ),
  },
  {
    id: "good-faith",
    title: "Good-faith research",
    body: (
      <>
        <p>
          No legal action will be taken against research done in good faith that stays within these
          limits:
        </p>
        <ul>
          <li>don’t access, change or delete data that isn’t yours;</li>
          <li>don’t disrupt the service, for example with denial-of-service or spam;</li>
          <li>don’t use social engineering or physical attacks;</li>
          <li>stop and report as soon as you find a problem.</li>
        </ul>
      </>
    ),
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security"
      lead="How this site, and the systems built here, are kept safe, and what to do if you find a problem."
      updated="16 November 2026"
      sections={sections}
    />
  );
}
