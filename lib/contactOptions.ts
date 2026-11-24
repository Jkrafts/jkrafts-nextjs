/**
 * Choices for the contact form's optional fields. Shared by the form and
 * the server route, which only forwards values from these lists. The
 * backend stores them as plain text on the enquiry.
 */
export const SERVICE_INTERESTS = [
  "Website",
  "Web application",
  "E-commerce",
  "Maintenance and support",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Under KSh 100k",
  "KSh 100k–300k",
  "KSh 300k–600k",
  "KSh 600k+",
  "Not sure yet",
] as const;

/** E.164, as the backend requires: a plus, then up to 15 digits. */
export const PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;
