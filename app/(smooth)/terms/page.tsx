import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CursorLink from "@/components/TargetCursor/CursorLink";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { contact } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description: "The terms for using the Jkrafts website, who owns its content, and how project work is agreed.",
  path: "/terms",
});

// Bracketed values are details only the business can confirm; replace them
// before launch.
const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        These terms cover your use of this website, run by Jkrafts. By using the site you accept them. Project work is covered separately, by the
        written proposal and agreement made for that project.
      </p>
    ),
  },
  {
    id: "use",
    title: "Using the site",
    body: (
      <ul>
        <li>You may browse, share links to and quote the site for personal or business research.</li>
        <li>Don’t try to break, overload or gain unauthorised access to the site or its server.</li>
        <li>Don’t use the contact form to send spam, malware or unlawful content.</li>
      </ul>
    ),
  },
  {
    id: "ownership",
    title: "Who owns what",
    body: (
      <>
        <p>
          The site’s design, writing and code belong to Jkrafts unless stated otherwise. Client names,
          logos and project details belong to their owners and are shown with permission. Fonts and
          open-source code are used under their own licences, listed on the{" "}
          <CursorLink href="/licenses">licences page</CursorLink>.
        </p>
        <p>
          Ownership of work made for a client is set out in that client’s agreement; by default, the
          client owns what they have paid for.
        </p>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Information on the site",
    body: (
      <p>
        Project descriptions, timelines and prices on the site are a general guide, not an offer. A
        proposal becomes binding only when both sides agree it in writing.
      </p>
    ),
  },
  {
    id: "links",
    title: "Links to other sites",
    body: (
      <p>
        Links to other sites, such as social networks, are provided for convenience. Jkrafts isn’t
        responsible for their content or their privacy practices.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <>
        <p>
          The site is provided as it is. Reasonable care is taken to keep it accurate and available,
          but there is no guarantee it will always be either.
        </p>
        <p>
          Jkrafts isn’t liable for indirect losses arising from use of the site. Nothing in these terms
          limits liability that cannot be limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of Kenya, and disputes go to the courts of Kenya.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these terms: <a href={`mailto:${contact.email}`}>{contact.email}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      lead="The ground rules for using this website."
      updated="16 November 2026"
      sections={sections}
    />
  );
}
