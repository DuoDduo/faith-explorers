import { expect, signUp, test, uniqueEmail } from "./helpers";

const ARTICLE = "/articles/the-art-of-spiritual-fasting";

test("readers comment, like and save articles", async ({ page }) => {
  await signUp(page, "Rita Reader", uniqueEmail("reader"));
  await page.goto(ARTICLE);

  const comment = `Thank you for this ${Date.now()}`;
  await page.getByLabel(/Comment as/).fill(comment);
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.locator(".article-comments").getByText(comment)).toBeVisible();

  const like = page.locator(".engagement button").filter({ hasText: /like/ });
  const before = Number((await like.textContent())!.match(/\d+/)![0]);
  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", "true");
  await expect(like).toContainText(String(before + 1));

  await page.locator(".engagement button").filter({ hasText: "Save" }).click();
  await expect(page.locator(".engagement button").filter({ hasText: "Saved" })).toBeVisible();

  await page.goto("/account/saved");
  await expect(page.locator(".editorcards .edcard h2")).toContainText([
    "The Art of Spiritual Fasting",
  ]);

  await page.goto(ARTICLE);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator(".comment")
    .filter({ hasText: comment })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.locator(".article-comments").getByText(comment)).toHaveCount(0);
});

test("newsletter sign-up needs email confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill(uniqueEmail("subscriber"));
  await page.locator(".footer").getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByText("Check your inbox for a link to confirm")).toBeVisible();
});
