import { expect, test } from "./helpers";

test("home page shows editor's picks and categories", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Faith Explorers", level: 1 })).toBeVisible();
  await expect(page.locator(".editorcards .edcard").first()).toBeVisible();
  await expect(page.locator(".hotcards .hcard").first()).toBeVisible();
});

test("articles can be paged through and searched", async ({ page }) => {
  await page.goto("/articles");
  const firstTitle = await page.locator(".editorcards .edcard h3").first().textContent();
  await page.locator(".pagination").getByRole("link", { name: "2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator(".editorcards .edcard h3").first()).not.toHaveText(firstTitle!);

  await page.getByRole("searchbox", { name: "Search articles" }).fill("fasting");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=fasting/);
  await expect(page.locator(".editorcards .edcard h3")).toContainText([
    "The Art of Spiritual Fasting",
  ]);
});

test("an article opens on its own page with metadata", async ({ page }) => {
  await page.goto("/articles/7-keys-to-building-a-christ-centered-relationship");
  await expect(page).toHaveTitle(
    "7 Keys to Building a Christ-Centered Relationship | Faith Explorers",
  );
  await expect(page.locator(".article-body p").first()).toBeVisible();
  await expect(page.getByText("Minister Uchechukwu").first()).toBeVisible();
});

test("articles can be shared and link to their author", async ({ page }) => {
  await page.goto("/articles/7-keys-to-building-a-christ-centered-relationship");
  const share = page.getByRole("region", { name: "Share this article" });
  await expect(share.getByRole("link", { name: "Share on WhatsApp" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/\?text=7%20Keys/,
  );

  await page.locator(".article-byline").getByRole("link", { name: "Minister Uchechukwu" }).click();
  await expect(page.getByRole("heading", { name: "Minister Uchechukwu", level: 1 })).toBeVisible();
  await expect(page.locator(".editorcards .edcard h3")).toContainText([
    "7 Keys to Building a Christ-Centered Relationship",
  ]);
});

test("categories list their articles", async ({ page }) => {
  await page.goto("/categories");
  await page
    .getByRole("link", { name: /Worship/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "Worship", level: 1 })).toBeVisible();
  await expect(page.locator(".editorcards .edcard")).toHaveCount(5);
});

test("unknown pages show the not-found page", async ({ page }) => {
  await page.goto("/articles/this-does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("feeds and robots are served", async ({ request }) => {
  const feed = await request.get("/feed.xml");
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  expect(await feed.text()).toContain("<item>");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/articles/");
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
});
