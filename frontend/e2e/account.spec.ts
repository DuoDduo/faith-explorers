import { expect, signIn, signUp, test, uniqueEmail } from "./helpers";

test("members manage their profile, password and account", async ({ page }) => {
  const email = uniqueEmail("member");
  await signUp(page, "Sam Member", email);
  await page.goto("/account/settings");

  await page.getByLabel("Name:").fill("Samuel Member");
  await page.getByLabel(/About you/).fill("Youth pastor in Abeokuta.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await expect(page.locator(".nav-account")).toHaveText(/Samuel/);

  await page.getByLabel("Current password:").fill("not my password");
  await page.getByLabel("New password:", { exact: true }).fill("second passphrase");
  await page.getByLabel("Repeat new password:").fill("second passphrase");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("That password isn't right")).toBeVisible();

  await page.getByLabel("Current password:").fill("a strong passphrase");
  await page.getByLabel("New password:", { exact: true }).fill("second passphrase");
  await page.getByLabel("Repeat new password:").fill("second passphrase");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password changed.")).toBeVisible();

  await page.getByRole("checkbox").check();
  await page.getByLabel("Your password:").fill("second passphrase");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.waitForURL("/");
  await expect(page.locator(".nav-account")).toHaveText(/Sign in/);

  await signIn(page, email, "second passphrase");
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
});
