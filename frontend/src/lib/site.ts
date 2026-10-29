/**
 * Public URL of the site, for absolute links (metadata, sitemap, robots.txt).
 * Set SITE_URL at build time as well as at runtime: prerendered pages embed it.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
