/**
 * The visitor's analytics consent. Nothing that sets cookies (Google Tag
 * Manager, GA4) loads until this is "granted" (components/Analytics.tsx);
 * components/CookieBanner.tsx asks for it, and the footer's "Cookie
 * settings" button reopens the banner to change it.
 *
 * Stored in localStorage (not a cookie), so remembering the choice doesn't
 * itself need consent.
 */

export type Consent = 'granted' | 'denied';
/** `unset` before a choice is made; `pending` while rendering on the server. */
export type ConsentState = Consent | 'unset' | 'pending';

const KEY = 'jk-consent';
const CHANGE = 'consentchange';
const OPEN = 'consentopen';

export function readConsent(): Consent | 'unset' {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function setConsent(value: Consent) {
  const previous = readConsent();
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Private mode etc.: the choice holds for this page view only.
  }
  window.dispatchEvent(new Event(CHANGE));

  // Withdrawing consent: remove the analytics cookies, and reload so the
  // already-running scripts are gone too.
  if (previous === 'granted' && value === 'denied') {
    clearAnalyticsCookies();
    window.location.reload();
  }
}

/** For useSyncExternalStore. */
export function subscribeConsent(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener(CHANGE, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export const consentServerSnapshot = (): ConsentState => 'pending';

/** Reopen the banner (footer "Cookie settings"). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN));
}

export function onConsentSettingsOpen(handler: () => void) {
  window.addEventListener(OPEN, handler);
  return () => window.removeEventListener(OPEN, handler);
}

function clearAnalyticsCookies() {
  const host = window.location.hostname;
  // GA sets its cookies on the top-level domain, e.g. ".jkrafts.com".
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
    if (name !== '_ga' && !name.startsWith('_ga_') && name !== '_gid' && name !== '_gat') continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}
