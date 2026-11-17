"use client";

import { useSyncExternalStore } from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { consentServerSnapshot, readConsent, subscribeConsent } from "@/lib/consent";

/**
 * Google Tag Manager and GA4, loaded only once the visitor has allowed
 * analytics (lib/consent.ts). Before that, and after a refusal, no Google
 * script is requested and no analytics cookie is set.
 *
 * GTM-* is a Tag Manager container id; G-* is a GA4 Measurement id.
 * Mounting <GoogleTagManager> twice produced two elements with the same id
 * (`_next-gtm`), so the GA4 id uses <GoogleAnalytics> instead.
 */
export default function Analytics() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, consentServerSnapshot);
  if (consent !== "granted") return null;
  return (
    <>
      <GoogleTagManager gtmId="GTM-PXL6NLM5" />
      <GoogleAnalytics gaId="G-8YGCX4RECJ" />
    </>
  );
}
