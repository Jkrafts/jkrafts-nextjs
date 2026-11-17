import CursorLink from "@/components/TargetCursor/CursorLink";
import Icon from "@/components/Icon";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { contact, legalItems, navItems, socials } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="shell grid-12 gap-y-12 pt-16 pb-10 md:pt-20">
        <div className="col-span-4 md:col-span-6">
          <p className="t-h3 max-w-[22ch]">Websites, web apps and business systems, built to last.</p>
          <ul className="mt-6 flex flex-col gap-1 text-lg">
            <li>
              <a href={`mailto:${contact.email}`} className="link inline-flex min-h-11 items-center">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-2 md:col-start-8">
          <h2 className="t-small mb-4 text-muted">Pages</h2>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <CursorLink href={item.href} className="inline-flex min-h-11 items-center hover:underline">
                  {item.label}
                </CursorLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-3 md:col-start-10">
          <h2 className="t-small mb-4 text-muted">Elsewhere</h2>
          <ul className="flex flex-col gap-1">
            {socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2.5 hover:underline"
                >
                  <Icon name={s.icon} size={18} />
                  {s.label}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 t-small text-muted md:col-span-12">
          <p>&copy; {year} Jkrafts. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center gap-x-5">
              {legalItems.map((item) => (
                <li key={item.href}>
                  <CursorLink href={item.href} className="inline-flex min-h-11 items-center hover:text-ink hover:underline">
                    {item.label}
                  </CursorLink>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="inline-flex min-h-11 cursor-pointer items-center hover:text-ink hover:underline" />
              </li>
            </ul>
          </nav>
          <a href="#main" className="inline-flex min-h-11 items-center hover:text-ink hover:underline">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
