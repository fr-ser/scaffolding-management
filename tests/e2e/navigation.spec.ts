import { test, expect } from "@playwright/test";

test("has navigation bar", async ({ page }) => {
  await page.goto("/");

  const menuBar = page.getByTestId("navigation-bar");
  await expect(menuBar).toContainText(/Dokumente/);
});
