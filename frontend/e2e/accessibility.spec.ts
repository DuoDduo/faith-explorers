import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, setRole, signUp, test, uniqueEmail } from "./helpers";

/** Run axe (WCAG 2.1 A and AA rules) and fail with a readable list of problems. */
async function expectNoViolations(page: Page) {
  // Scroll-in animations fade elements in; settle them so contrast is measured at full opacity.
  await page.addStyleTag({
    content:
      "[data-aos], [data-aos] * { opacity: 1 !important; transform: none !important; transition: none !important; }",
  });
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} — ${v.nodes
        .map((n) => n.target.join(" "))
        .slice(0, 3)
        .join(", ")}`,
  );
  expect(summary).toEqual([]);
}

const PUBLIC_PAGES = [
  "/",
  "/articles",
  "/articles/7-keys-to-building-a-christ-centered-relationship",
  "/categories",
  "/categories/worship",
  "/about",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/become-an-author",
];

for (const path of PUBLIC_PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    await expectNoViolations(page);
  });
}

test("an author page has no accessibility violations", async ({ page }) => {
  // Author ids change with every re-seed, so reach the page through a byline.
  await page.goto("/articles/7-keys-to-building-a-christ-centered-relationship");
  await page.locator(".article-byline .author-name").click();
  await page.waitForURL(/\/authors\/\d+$/);
  await page.waitForLoadState("networkidle");
  await expectNoViolations(page);
});

test("signed-in pages have no accessibility violations", async ({ page }) => {
  const email = uniqueEmail("a11y");
  await signUp(page, "Ada Access", email);
  setRole(email, "admin");
  for (const path of [
    "/account",
    "/account/settings",
    "/account/saved",
    "/dashboard",
    "/dashboard/new",
    "/admin",
    "/admin/posts",
    "/admin/users",
    "/admin/newsletter",
  ]) {
    await test.step(path, async () => {
      await page.goto(path, { waitUntil: "networkidle" });
      await expectNoViolations(page);
    });
  }
});

test("keyboard users can skip to the content and see where focus is", async ({ page }) => {
  await page.goto("/articles");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press("Tab");
  const outline = await page.evaluate(
    () => getComputedStyle(document.activeElement as Element).outlineStyle,
  );
  expect(outline).toBe("solid");
});
