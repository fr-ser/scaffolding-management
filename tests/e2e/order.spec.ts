import { expect, test } from "@playwright/test";

import { getOrderEditPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("create, edit and delete an order", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // create
  await page.getByTestId("order-create-button").click();

  await page.getByLabel("Bauvorhaben").fill("title " + timestamp);
  await page.getByLabel("Beschreibung").fill("test description");

  await page.getByTestId("order-client-select").locator("input").fill("Company 1");
  await page.getByRole("option").first().click();
  await page.getByTestId("order-save-button").click();
  await expect(page.getByText("Ein neuer Auftrag wurde erstellt")).toBeVisible();

  // check filtering
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1); // toHaveCount retries, naturally absorbing the 250ms search debounce

  // edit
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.getByLabel("Bauvorhaben").fill("new-title " + timestamp);
  await page.getByTestId("order-save-button").click();
  await expect(page.getByText("Der Auftrag wurde gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Bauvorhaben")).toHaveValue("new-title " + timestamp);

  // delete
  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1); // toHaveCount retries, naturally absorbing the 250ms search debounce
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();
  await expect(page.getByTestId("order-card")).toHaveCount(0);
});

test("switches between grouped suborders", async ({ page }) => {
  await page.goto(getOrderEditPath("A1"));

  await expect(page.getByRole("tab", { name: "Angebote (2)" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Gutschriften (2)" })).toBeVisible();

  await page.getByRole("tab", { name: "Gutschriften (2)" }).click();
  const creditNotesPanel = page.getByRole("tabpanel", { name: "Gutschriften (2)" });
  const titleInput = creditNotesPanel.locator('[data-name="description"] input').first();

  await page.getByRole("button", { name: "Gutschrift 01.03.2023" }).click();
  await expect(titleInput).toHaveValue("Grouping Example Credit Note Item 1");

  await page.getByRole("button", { name: "Gutschrift 02.03.2023" }).click();
  await expect(titleInput).toHaveValue("Grouping Example Credit Note Item 2");
});
