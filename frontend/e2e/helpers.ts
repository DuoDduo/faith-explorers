import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { type Browser, expect, type Page, test as base } from "@playwright/test";

const rand = (n: number) => Math.floor(Math.random() * n);
const visitorIp = () => `10.${rand(255)}.${rand(255)}.${rand(254) + 1}`;

/**
 * Each test acts as a different visitor IP (forwarded the same way real traffic is), so the
 * API's per-IP rate limits don't trip while the suite signs up many accounts.
 */
export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.setExtraHTTPHeaders({ "X-Forwarded-For": visitorIp() });
    await provide(context);
  },
});
export { expect };

/** A separate browser session (another person) with its own visitor IP. */
export async function newVisitor(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    extraHTTPHeaders: { "X-Forwarded-For": visitorIp() },
  });
  return context.newPage();
}

export const PASSWORD = "a strong passphrase";

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${rand(1e6)}@example.com`;
}

export async function signUp(page: Page, name: string, email: string, password = PASSWORD) {
  await page.goto("/register");
  await page.getByLabel("Name:").fill(name);
  await page.getByLabel("Email:").fill(email);
  await page.getByLabel("Password:").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/");
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email:").fill(email);
  await page.getByLabel("Password:", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Run SQL against the test database (used to set up roles the UI can't grant yet). */
export function sql(query: string): void {
  const url = process.env.E2E_DATABASE_URL;
  if (!url) throw new Error("Set E2E_DATABASE_URL to the API's Postgres URL (postgresql://…)");
  execFileSync("psql", [url, "-qc", query]);
}

export function setRole(email: string, role: "reader" | "author" | "admin"): void {
  sql(`UPDATE users SET role = '${role}' WHERE email = '${email.replace(/'/g, "''")}'`);
}

/**
 * The API's console email backend writes emails to its log; read the newest link sent to
 * `to` for `path` (e.g. "/reset-password"). Retries while the background send finishes.
 */
export async function emailToken(to: string, path: string): Promise<string> {
  const logPath = process.env.E2E_API_LOG;
  if (!logPath) throw new Error("Set E2E_API_LOG to the API server's log file");
  const pattern = new RegExp(`${path.replace(/\//g, "\\/")}\\?token=([\\w-]+)`);
  for (let attempt = 0; attempt < 40; attempt++) {
    const log = readFileSync(logPath, "utf8");
    const start = log.lastIndexOf(`Email to ${to}`);
    const match = start >= 0 ? log.slice(start).match(pattern) : null;
    if (match) return match[1];
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No ${path} email found for ${to}`);
}
