import { emailToken, expect, PASSWORD, signIn, signUp, test, uniqueEmail } from "./helpers";

test("sign up, sign out and sign back in", async ({ page }) => {
  const email = uniqueEmail("auth");
  await signUp(page, "Grace Okafor", email);
  await expect(page.locator(".nav-account")).toHaveText(/Grace/);

  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.locator(".nav-account")).toHaveText(/Sign in/);

  await signIn(page, email, "wrong password");
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  await signIn(page, email);
  await page.waitForURL("/");
  await expect(page.locator(".nav-account")).toHaveText(/Grace/);
});

test("signed-out visitors are sent to sign in and back", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
});

test("forgotten password can be reset by email", async ({ page }) => {
  const email = uniqueEmail("reset");
  await signUp(page, "Faith Forgetful", email);
  await page.context().clearCookies();

  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await page.waitForURL("/forgot-password");
  await page.getByLabel("Email:").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If an account uses that email")).toBeVisible();

  const token = await emailToken(email, "/reset-password");
  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel("New password:", { exact: true }).fill("brand new passphrase");
  await page.getByLabel("Repeat new password:").fill("brand new passphrase");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByText("Your password has been changed. Please sign in.")).toBeVisible();

  await signIn(page, email, PASSWORD);
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  await signIn(page, email, "brand new passphrase");
  await page.waitForURL("/");
});
