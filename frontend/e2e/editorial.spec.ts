import { expect, newVisitor, setRole, signUp, test, uniqueEmail } from "./helpers";

test("an application and an article go through review", async ({ browser }) => {
  test.setTimeout(90_000); // several people and many steps
  const writerEmail = uniqueEmail("writer");
  const adminEmail = uniqueEmail("admin");
  const title = `Rest for the Weary ${Date.now()}`;

  const writer = await newVisitor(browser);
  const admin = await newVisitor(browser);
  await signUp(admin, "Pastor Admin", adminEmail);
  setRole(adminEmail, "admin");

  // A reader applies and an admin approves.
  await signUp(writer, "Andrew Writer", writerEmail);
  await writer.goto("/become-an-author");
  await writer
    .getByLabel(/What would you like to write about/)
    .fill("I lead a youth group and write devotionals every week.");
  await writer.getByRole("button", { name: "Send application" }).click();
  await expect(writer.getByText("We'll review your application soon")).toBeVisible();

  await admin.goto("/admin/applications");
  const card = admin.locator(".admin-card").filter({ hasText: writerEmail });
  admin.once("dialog", (dialog) => dialog.accept());
  await card.getByRole("button", { name: "Approve" }).click();
  await expect(card).toHaveCount(0);

  // The new author writes and submits an article.
  await writer.goto("/dashboard/new");
  await writer.getByLabel("Title:").fill(title);
  await writer.getByLabel(/Summary/).fill("Finding Sabbath rest in a busy season of life.");
  await writer.getByLabel("Category:").selectOption("spiritual-disciplines");
  await writer
    .getByLabel("Article:")
    .fill("Come to me, all who labor.\n\nTake one hour this week.");
  await writer.getByRole("button", { name: "Save draft" }).click();
  await writer.waitForURL(/\/dashboard\/\d+\/edit/);
  writer.once("dialog", (dialog) => dialog.accept());
  await writer.getByRole("button", { name: "Submit for review" }).click();
  await expect(writer.locator(".bigtitle .status-badge")).toHaveText("In review");

  // The admin sends it back with a note; the author sees it and resubmits.
  await admin.goto("/admin/posts");
  await admin.getByRole("link", { name: title }).click();
  await admin.getByRole("button", { name: "Send back" }).click();
  await admin
    .getByLabel("Note for the writer (optional)")
    .fill("Please add a scripture reference.");
  await admin.getByRole("button", { name: "Send back to author" }).click();
  await expect(admin.locator(".admin-review__header .status-badge")).toHaveText("Draft");

  await writer.reload();
  await expect(writer.getByText("Please add a scripture reference.")).toBeVisible();
  writer.once("dialog", (dialog) => dialog.accept());
  await writer.getByRole("button", { name: "Submit for review" }).click();
  await expect(writer.locator(".bigtitle .status-badge")).toHaveText("In review");

  // Published articles are public.
  await admin.goto("/admin/posts");
  await admin.getByRole("link", { name: title }).click();
  admin.once("dialog", (dialog) => dialog.accept());
  await admin.getByRole("button", { name: "Publish" }).click();
  await expect(admin.locator(".admin-review__header .status-badge")).toHaveText("Published");

  const visitor = await newVisitor(browser);
  await visitor.goto(`/articles?q=${encodeURIComponent(title)}`);
  await visitor.getByRole("link", { name: title }).first().click();
  await expect(visitor.getByRole("heading", { level: 1 })).toHaveText(title);
});

test("readers can't reach the admin or the dashboard", async ({ page }) => {
  await signUp(page, "Curious Reader", uniqueEmail("curious"));
  await page.goto("/admin");
  await expect(page).toHaveURL("/");
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/become-an-author");
});
