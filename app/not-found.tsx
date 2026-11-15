import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorLink from "@/components/TargetCursor/CursorLink";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="shell flex min-h-[80svh] flex-col justify-end pt-[calc(var(--header-h)+4rem)] pb-[var(--section)]">
        <p className="t-small text-muted">Error 404</p>
        <h1 className="t-display mt-4 max-w-[12ch]">This page doesn’t exist.</h1>
        <p className="t-lead mt-8 max-w-[40ch] text-muted">
          The link may be out of date, or the address mistyped. Head back to the home page, or browse the
          project stories.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <CursorLink href="/" className="btn btn-primary">
            Go to the home page
          </CursorLink>
          <CursorLink href="/projects" className="btn btn-outline">
            Browse projects
          </CursorLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
