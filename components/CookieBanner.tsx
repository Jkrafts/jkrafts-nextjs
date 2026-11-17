"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CursorLink from "@/components/TargetCursor/CursorLink";
import {
  consentServerSnapshot,
  onConsentSettingsOpen,
  readConsent,
  setConsent,
  subscribeConsent,
  type Consent,
} from "@/lib/consent";
import "./CookieBanner.css";

/**
 * Asks once for analytics consent. Allowing and refusing are equally easy
 * (same size, same style, side by side), nothing loads until a choice is
 * made, and the banner doesn't block the page: it isn't a modal, so the
 * site stays usable without answering.
 *
 * Opened again from the footer's "Cookie settings", it takes focus so
 * keyboard users land on it; on first visit it leaves focus alone.
 */
export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, consentServerSnapshot);
  const [reopened, setReopened] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => onConsentSettingsOpen(() => setReopened(true)), []);

  useEffect(() => {
    if (reopened) ref.current?.focus();
  }, [reopened]);

  const open = consent === "unset" || reopened;
  if (!open) return null;

  const choose = (value: Consent) => {
    setReopened(false);
    setConsent(value);
  };

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby="cookie-title"
      className="cookie-banner"
    >
      <h2 id="cookie-title" className="font-semibold">
        Analytics cookies
      </h2>
      <p className="mt-2 t-small text-muted">
        With your permission, Google Analytics counts visits so I can see which pages are useful.
        Nothing is set until you choose.{" "}
        <CursorLink href="/cookies" className="link text-ink">
          Cookie policy
        </CursorLink>
      </p>
      {consent !== "unset" && consent !== "pending" && (
        <p className="mt-2 t-small text-muted">
          Currently: analytics {consent === "granted" ? "allowed" : "refused"}.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" className="btn btn-outline" onClick={() => choose("denied")}>
          Refuse
        </button>
        <button type="button" className="btn btn-outline" onClick={() => choose("granted")}>
          Allow
        </button>
      </div>
    </section>
  );
}
