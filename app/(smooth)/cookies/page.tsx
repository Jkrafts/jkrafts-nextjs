import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies and browser storage this site uses, and how to change your choice.",
};

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "In short",
    body: (
      <>
        <p>
          This site sets no cookies unless you allow analytics. If you do, Google Analytics sets two
          cookies to count visits. Your choice, and your light or dark theme, are remembered in your
          browser’s local storage, which never leaves your device.
        </p>
        <p>
          <CookieSettingsButton className="btn btn-outline" />
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics cookies (only with your consent)",
    body: (
      <div className="table-wrap" role="region" aria-label="Analytics cookies" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Set by</th>
              <th scope="col">Purpose</th>
              <th scope="col">Expires</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>_ga</code>
              </td>
              <td>Google Analytics</td>
              <td>Tells visits apart, without identifying you</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>
                <code>_ga_8YGCX4RECJ</code>
              </td>
              <td>Google Analytics</td>
              <td>Keeps track of the current visit</td>
              <td>2 years</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "storage",
    title: "Browser storage (always on, never shared)",
    body: (
      <div className="table-wrap" role="region" aria-label="Browser storage" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Purpose</th>
              <th scope="col">Kept until</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>jk-consent</code>
              </td>
              <td>Remembers whether you allowed or refused analytics</td>
              <td>You clear your browser data</td>
            </tr>
            <tr>
              <td>
                <code>theme</code>
              </td>
              <td>Remembers light or dark mode</td>
              <td>You clear your browser data</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "fonts",
    title: "Fonts and other files",
    body: (
      <p>
        Fonts, images and scripts are served from this site itself. Your browser makes no requests to
        Google Fonts or other font services.
      </p>
    ),
  },
  {
    id: "control",
    title: "Changing your mind",
    body: (
      <p>
        Use “Cookie settings” at the foot of any page to allow or refuse analytics. Refusing after
        allowing deletes the analytics cookies. You can also block or delete cookies in your browser’s
        settings; the site works fully without them.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      lead="What this site stores in your browser, and how to change it."
      updated="16 November 2026"
      sections={sections}
    />
  );
}
