/**
 * Only allow redirects to paths on this site, so ?next= can't send users elsewhere.
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function loginHref(next?: string): string {
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}
