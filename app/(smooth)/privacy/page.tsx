import type { Metadata } from "next";
import CursorLink from "@/components/TargetCursor/CursorLink";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal data Jkrafts collects, why, how long it is kept and your rights over it.",
};

// Bracketed values are details only the business can confirm; replace them
// before launch.
const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who is responsible",
    body: (
      <>
        <p>
          This site is run by Jkrafts. Jkrafts decides how the
          personal data described here is used, and is responsible for it.
        </p>
        <p>
          Questions about your data, or requests to use your rights, go to{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What I collect",
    body: (
      <ul>
        <li>
          <strong>What you send through the contact form:</strong> your name, email address, subject
          and message. If you arrived from a project story, the subject names that project.
        </li>
        <li>
          <strong>Emails and messages</strong> you send directly, and anything you choose to include.
        </li>
        <li>
          <strong>Analytics, only if you allow it:</strong> the pages you visit, how you arrived, your
          browser and device type and your approximate location, collected by Google Analytics. Your
          IP address is not stored by Google Analytics 4.
        </li>
        <li>
          <strong>Server logs</strong> kept by the hosting provider for security: IP address, time of
          request and the page requested.
        </li>
      </ul>
    ),
  },
  {
    id: "why",
    title: "Why, and on what basis",
    body: (
      <div className="table-wrap" role="region" aria-label="Purposes and legal bases" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Purpose</th>
              <th scope="col">Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Replying to your enquiry and preparing a proposal or quote</td>
              <td>Steps you asked for before a contract, and legitimate interests</td>
            </tr>
            <tr>
              <td>Delivering and supporting a project you have commissioned</td>
              <td>Performance of a contract</td>
            </tr>
            <tr>
              <td>Understanding which pages are useful (analytics)</td>
              <td>Your consent, which you can withdraw at any time</td>
            </tr>
            <tr>
              <td>Keeping the site secure and working</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Keeping invoices and business records</td>
              <td>Legal obligation</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "sharing",
    title: "Who it is shared with",
    body: (
      <>
        <p>Your data is never sold. It is shared only with services that help run the site:</p>
        <ul>
          <li>Netlify, which hosts this site and the server that receives the contact form.</li>
          <li>Webmail, which delivers and stores email.</li>
          <li>
            Google (Google Analytics and Google Tag Manager), only if you allow analytics. Google may
            process data in the United States under its standard contractual clauses.
          </li>
        </ul>
        <p>
          Data may also be disclosed where the law requires it, for example to a court or regulator.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long it is kept",
    body: (
      <ul>
        <li>Enquiries that don’t become a project: [12 months] after the last message.</li>
        <li>Client and project records: for the length of the work, then [6 years] for tax and legal purposes.</li>
        <li>Analytics data: [14 months], then deleted by Google automatically.</li>
        <li>Server logs: [30 days].</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask to:</p>
        <ul>
          <li>get a copy of the data held about you;</li>
          <li>have it corrected or deleted;</li>
          <li>restrict or object to how it is used;</li>
          <li>receive it in a portable format;</li>
          <li>withdraw consent to analytics, using “Cookie settings” at the foot of every page.</li>
        </ul>
        <p>
          Requests are answered within one month. If you’re unhappy with the answer, you can complain
          to the data protection authority where you live, for example the Information
          Commissioner’s Office in the UK or the Office of the Data Protection Commissioner in Kenya.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        Analytics cookies are set only with your permission. The{" "}
        <CursorLink href="/cookies">cookie policy</CursorLink> lists each one.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        The site is served over HTTPS and the contact form is sent over an encrypted connection. The{" "}
        <CursorLink href="/security">security page</CursorLink> explains more, and how to report a
        problem.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>When this policy changes, the date at the top of the page changes with it.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lead="What personal data this site collects, why, and what you can do about it."
      updated="16 November 2026"
      sections={sections}
    />
  );
}
