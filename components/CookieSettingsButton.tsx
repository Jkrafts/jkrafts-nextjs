"use client";

import { openConsentSettings } from "@/lib/consent";

/** Reopens the cookie banner so the visitor can change their choice. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openConsentSettings}>
      Cookie settings
    </button>
  );
}
