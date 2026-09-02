import { test, expect } from "@playwright/test";

/** Login with the seeded demo account and walk the core screens. */
test("demo user can log in and see feed, pack and walks", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "demo1@petdate.app");
  await page.fill('input[type="password"]', "Petdate123!");
  await page.click('button:text-is("Log in")');
  await page.waitForURL("**/home", { timeout: 45_000 });

  // feed renders posts from the API
  await expect(page.locator("article .post-body").first()).toBeVisible({ timeout: 20_000 });

  // pack shows distance-sorted dog cards
  await page.goto("/pack");
  await expect(page.locator(".dog-card").first()).toBeVisible({ timeout: 20_000 });

  // walks shows the plan list
  await page.goto("/walks");
  await expect(page.getByRole("heading", { name: "Walks" })).toBeVisible();
});
