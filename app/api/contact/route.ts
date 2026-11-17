/**
 * POST /api/contact: receives the contact form and forwards it to the
 * Laravel API, server to server. On Netlify this route handler runs as a
 * serverless function; locally it runs under `next dev` / `next start`.
 *
 * Doing the hand-off here (rather than posting from the browser straight to
 * Laravel) keeps the Laravel URL and any credentials out of the page, needs
 * no CORS on the Laravel side, and lets obvious junk be rejected before it
 * costs Laravel anything. Other methods get Next's automatic 405.
 *
 * Environment (read at request time, never sent to the browser; on Netlify:
 * Site configuration → Environment variables, scoped to Functions):
 * - LARAVEL_API_URL    required, e.g. https://api.jkrafts.com/api
 * - LARAVEL_API_TOKEN  optional; sent as a bearer token if set
 *
 * Responses are JSON `{ message, errors? }`. Validation failures (here or
 * from Laravel) are 422 with per-field `errors`; anything that goes wrong
 * upstream is a generic 502, with the detail logged rather than returned.
 */

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 } as const;
type Field = keyof typeof LIMITS;
const FIELDS = Object.keys(LIMITS) as Field[];
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
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return json(200, { message: "Thanks. Your message has been sent." });
  }

  const data = {} as Record<Field, string>;
  const errors: Partial<Record<Field, string[]>> = {};
  for (const field of FIELDS) {
    const value = typeof input[field] === "string" ? (input[field] as string).trim() : "";
    if (!value) errors[field] = [`The ${field} field is required.`];
    else if (value.length > LIMITS[field]) errors[field] = [`The ${field} must be at most ${LIMITS[field]} characters.`];
    data[field] = value;
  }
  if (!errors.email && !EMAIL.test(data.email)) errors.email = ["Enter a valid email address."];
  if (Object.keys(errors).length) {
    return json(422, { message: "Please check the highlighted fields.", errors });
  }

  const base = process.env.LARAVEL_API_URL?.replace(/\/+$/, "");
  if (!base) {
    console.error("contact: LARAVEL_API_URL is not set");
    return unavailable();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (process.env.LARAVEL_API_TOKEN) headers.Authorization = `Bearer ${process.env.LARAVEL_API_TOKEN}`;
  // Lets Laravel rate-limit per visitor rather than per server. Netlify
  // puts the visitor's address in x-nf-client-connection-ip.
  const ip =
    req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (ip) headers["X-Forwarded-For"] = ip;

  let upstream: Response;
  try {
    upstream = await fetch(`${base}/contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("contact: Laravel API unreachable", error);
    return unavailable();
  }

  if (upstream.ok) return json(200, { message: "Thanks. Your message has been sent." });

  const body = (await upstream.json().catch(() => null)) as { message?: unknown; errors?: unknown } | null;
  // Laravel's own validation errors are safe and useful to show.
  if (upstream.status === 422 && body && typeof body.message === "string") {
    return json(422, { message: body.message, errors: body.errors ?? {} });
  }
  if (upstream.status === 429) {
    return json(429, { message: "Too many messages in a short time. Please wait a minute and try again." });
  }
  console.error(`contact: Laravel API responded ${upstream.status}`, body);
  return unavailable();
}

