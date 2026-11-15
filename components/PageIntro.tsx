import type { ReactNode } from "react";

type PageIntroProps = {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
};

/**
 * Opening block for inner pages: a large, left-aligned title with an
 * optional lead paragraph. The intro animation hooks onto `data-intro`.
 */
export default function PageIntro({ title, lead, children }: PageIntroProps) {
  return (
    <header className="shell pt-[calc(var(--header-h)+clamp(3.5rem,10vw,9rem))] pb-[clamp(3rem,7vw,6rem)]">
      <div className="grid-12 gap-y-8">
        <h1 className="t-h1 col-span-4 md:col-span-11 lg:col-span-10">{title}</h1>
        {lead && (
          <p data-page-lead className="t-lead col-span-4 text-muted md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            {lead}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
