import { BUDGET_RANGES, PHONE_PATTERN, SERVICE_INTERESTS } from "@/lib/contactOptions";

/**
 * POST /api/contact: receives the contact form and forwards it to the
 * JKrafts backend (Laravel), server to server. On Netlify this route handler
 * runs as a serverless function; locally it runs under `next dev` / `next start`.
 *
 * Doing the hand-off here (rather than posting from the browser straight to
 * Laravel) keeps the backend URL and API key out of the page, needs no CORS
 * on the backend, and lets obvious junk be rejected before it costs the
 * backend anything. Other methods get Next's automatic 405.
 *
 * Environment (read at request time, never sent to the browser; on Netlify:
 * Site configuration → Environment variables, scoped to Functions):
 * - CONTACT_API_URL  required, the backend API base, e.g. https://admin.jkrafts.com/api/v1
 * - CONTACT_API_KEY  required, the backend's CONTACT_API_KEY, sent as X-Api-Key
 *
 * The backend contract is POST {CONTACT_API_URL}/contact-submissions with
 * X-Api-Key; it trusts X-Client-Ip and X-Client-User-Agent (the visitor's,
 * not this server's) only after the key matches, and rate-limits per visitor.
 *
 * Responses are JSON `{ message, errors? }`. Validation failures (here or
 * from the backend) are 422 with per-field `errors`; anything that goes wrong
 * upstream is a generic 502, with the detail logged rather than returned.
 */

const REQUIRED = { name: 120, email: 254, subject: 200, message: 5000 } as const;
type RequiredField = keyof typeof REQUIRED;
const REQUIRED_FIELDS = Object.keys(REQUIRED) as RequiredField[];

type OptionalField = "company" | "phone" | "service_interest" | "budget_range";
type Field = RequiredField | OptionalField;

const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const unavailable = () =>
  json(502, { message: "Your message couldn’t be sent right now. Please try again in a moment." });

/** Host of an Origin header; `null` (e.g. "null" from sandboxed frames) never matches. */
function hostOf(origin: string) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** The path of the page the form was sent from, when the referrer is this site. */
function sourcePage(req: Request, host: string | null) {
  const referer = req.headers.get("referer");
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return url.host === host ? url.pathname.slice(0, 2048) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // Only accept submissions from this site's own pages.
  // Compared with the Host the browser sent (or the proxy's forwarded one),
  // not req.url, which the server may rebuild from its own hostname.
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && hostOf(origin) !== host) {
    return json(403, { message: "Forbidden." });
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { message: "That message is too long." });
  }

  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    input = parsed as Record<string, unknown>;
  } catch {
    return json(400, { message: "The form data couldn’t be read." });
  }

  // Honeypot: a field people never see. Bots that fill it get a normal
  // success, so they learn nothing, and nothing is sent.
  if (text(input.website_url) !== "") {
    return json(200, { message: "Thanks. Your message has been sent." });
  }

  const data: Partial<Record<Field | "source_page", string>> = {};
  const errors: Partial<Record<Field, string[]>> = {};

  for (const field of REQUIRED_FIELDS) {
    const value = text(input[field]);
    if (!value) errors[field] = [`The ${field} field is required.`];
    else if (value.length > REQUIRED[field]) errors[field] = [`The ${field} must be at most ${REQUIRED[field]} characters.`];
    data[field] = value;
  }
  if (!errors.email && !EMAIL.test(data.email ?? "")) errors.email = ["Enter a valid email address."];

  const company = text(input.company);
  if (company.length > 255) errors.company = ["The company must be at most 255 characters."];
  else if (company) data.company = company;

  // People type numbers with spaces or dashes; the backend wants plain E.164.
  const phone = text(input.phone).replace(/[\s\-().]/g, "");
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = ["Enter the number with its country code, for example +254712345678."];
  else if (phone) data.phone = phone;

  const service = text(input.service_interest);
  if (service && !(SERVICE_INTERESTS as readonly string[]).includes(service)) errors.service_interest = ["Choose one of the listed services."];
  else if (service) data.service_interest = service;

  const budget = text(input.budget_range);
  if (budget && !(BUDGET_RANGES as readonly string[]).includes(budget)) errors.budget_range = ["Choose one of the listed budgets."];
  else if (budget) data.budget_range = budget;

  if (Object.keys(errors).length) {
    return json(422, { message: "Please check the highlighted fields.", errors });
  }

  const page = sourcePage(req, host);
  if (page) data.source_page = page;

  const base = process.env.CONTACT_API_URL?.replace(/\/+$/, "");
  const key = process.env.CONTACT_API_KEY;
  if (!base || !key) {
    console.error("contact: CONTACT_API_URL and CONTACT_API_KEY must both be set");
    return unavailable();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": key,
  };
  // The visitor's address and browser, so the backend rate-limits and records
  // the visitor rather than this server. Netlify puts the address in
  // x-nf-client-connection-ip.
  const ip =
    req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (ip) headers["X-Client-Ip"] = ip;
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers["X-Client-User-Agent"] = userAgent.slice(0, 512);

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/contact-submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("contact: backend unreachable", error);
    return unavailable();
  }

  if (upstream.ok) return json(200, { message: "Thanks. Your message has been sent." });

  const body = (await upstream.json().catch(() => null)) as { message?: unknown; errors?: unknown } | null;
  // The backend's own validation errors are safe and useful to show.
  if (upstream.status === 422 && body && typeof body.message === "string") {
    return json(422, { message: body.message, errors: body.errors ?? {} });
  }
  if (upstream.status === 429) {
    return json(429, { message: "Too many messages in a short time. Please wait a minute and try again." });
  }
  if (upstream.status === 401) {
    console.error("contact: the backend rejected CONTACT_API_KEY (401)");
    return unavailable();
  }
  console.error(`contact: backend responded ${upstream.status}`, body);
  return unavailable();
}
