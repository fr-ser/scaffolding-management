import { expect, test } from "@playwright/test";

import { getArticleListPath } from "../../frontend/src/helpers/routes";

test("create, edit and delete an article", async ({ page }) => {
  await page.goto(getArticleListPath());

  const timestamp = String(Date.now());

  // create
  await page.getByTestId("article-create-button").click();

  const newArticleCard = page.getByTestId("article-card").filter({ hasText: "NEU" });

  await newArticleCard.getByLabel("Titel").fill("title " + timestamp);
  await newArticleCard.getByLabel("Bezeichnung").fill("test description");
  await newArticleCard.getByLabel("Einheit").fill("test unit");
  await newArticleCard.getByTestId("price-input").locator("input").fill("1,23");

  await newArticleCard.getByTestId("article-save-button").click();
  await expect(page.getByText("Ein neuer Artikel wurde erstellt")).toBeVisible();

  // check filtering
  await page.getByTestId("article-search-input").fill(timestamp);
  await page.waitForTimeout(300); // debounce time
  expect(await page.getByTestId("article-card").count()).toBe(1);

  // edit
  await page.getByLabel("Bezeichnung").fill("new-description");
  await page.getByTestId("article-save-button").click();
  await expect(page.getByText("Die Änderungen wurden gespeichert")).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(
    await page.getByTestId("article-card").first().getByLabel("Bezeichnung").inputValue(),
  ).toBe("new-description");

  // delete
  await page.getByTestId("article-card").first().getByTestId("article-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Artikel wurde gelöscht")).toBeVisible();

  await page.getByTestId("article-search-input").fill(timestamp);
  await page.waitForTimeout(300); // debounce time
  await expect(page.getByTestId("article-card")).not.toBeVisible();
});
