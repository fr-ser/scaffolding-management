import { expect, test } from "@playwright/test";

import { getOrderListPath } from "../../frontend/src/helpers/routes";

test("create, edit and delete an order", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // create
  await page.getByTestId("order-create-button").click();

  await page.getByLabel("Bauvorhaben").fill("title " + timestamp);
  await page.getByLabel("Beschreibung").fill("test description");

  await page.getByTestId("order-client-select").locator("button").click();
  await page.getByRole("option").first().click();
  await page.getByTestId("order-save-button").click();
  await expect(page.getByText("Ein neuer Auftrag wurde erstellt")).toBeVisible();

  // check filtering
  await page.getByTestId("order-search-input").fill(timestamp);
  await page.waitForTimeout(300); // debounce time
  expect(await page.getByTestId("order-card").count()).toBe(1);

  // edit
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.getByLabel("Bauvorhaben").fill("new-title " + timestamp);
  await page.getByTestId("order-save-button").click();
  await expect(page.getByText("Der Auftrag wurde gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Bauvorhaben")).toHaveValue("new-title " + timestamp);

  // delete
  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();

  await page.getByTestId("order-search-input").fill(timestamp);
  await page.waitForTimeout(300); // debounce time
  await expect(page.getByTestId("order-card")).not.toBeVisible();
});
