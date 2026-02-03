'use client';
import { useLayoutEffect, useRef } from "react";

const Footer = () => {

  const footerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      document.documentElement.style.setProperty(
        "--footer-height",
        `${entry.contentRect.height}px`
      );
    });

    ro.observe(footer);

    return () => ro.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="snap-footer w-full border-t mt-16 py-8 text-center text-sm text-gray-500">
      <div className="font-heading font-extrabold text-text text-3xl mb-4">
        Building lasting creations with passion and precision.
      </div>
      <div>
        &copy; {new Date().getFullYear()} Jkrafts. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;