import { expect, test } from "@playwright/test";

import { getDocumentListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("add line items from inventory, manually, and as a heading", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // Create an order to work with
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill("Line Items Test " + timestamp);
  await page.getByTestId("order-client-select").locator("input").fill("Company 1");
  await expect(page.getByRole("option").first()).toBeVisible();
  await page.getByRole("option").first().click();
  await page.getByTestId("order-save-button").click();
  await page.waitForURL("**/orders");

  // Navigate to the created order
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.waitForURL("**/orders/**/edit");

  // Create an offer as the document vehicle for this test
  await page.getByRole("button", { name: "Angebot erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Angebot" })).toBeVisible();
  await page.getByRole("tab", { name: "Angebot" }).click();

  // Add line item 1: select an existing article from inventory
  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt")).toBeVisible();
  await page.locator("button:has(.pi-search)").first().click();
  const articlePickerDialog = page.getByRole("dialog", { name: "Artikel" });
  await expect(articlePickerDialog).toBeVisible();
  await articlePickerDialog.getByPlaceholder("Suche").fill("Art1");
  await expect(articlePickerDialog.getByText("Art1 - Title 1")).toBeVisible();
  await articlePickerDialog.getByText("Art1 - Title 1").click();
  // Unit and price are auto-filled from inventory; set quantity manually
  await page.locator('[data-name="amount"]').first().locator("input").nth(0).pressSequentially("3");

  // Add line item 2: manually entered item not from inventory
  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt").first()).toBeVisible();
  // nth(1): index 0 = Art1, index 1 = this item, index 2 = auto-note (disabled, always last)
  const item2DescSection = page.locator('[data-name="description"]').nth(1);
  await item2DescSection.locator("input").fill("Custom scaffolding item");
  await item2DescSection.locator("textarea").fill("Custom scaffolding item description");
  const item2AmountSection = page.locator('[data-name="amount"]').nth(1);
  await item2AmountSection.locator("input").nth(0).pressSequentially("5");
  await item2AmountSection.locator("input").nth(1).fill("pcs");
  await item2AmountSection.locator("input").nth(2).pressSequentially("25");

  // Add line item 3: heading/note (no amount fields)
  await page.getByRole("button", { name: "Hinweis" }).click();
  await expect(page.getByText("Hinweis hinzugefügt").first()).toBeVisible();
  // nth(2): index 0 = Art1, index 1 = custom item, index 2 = this heading, index 3 = auto-note
  const item3DescSection = page.locator('[data-name="description"]').nth(2);
  await item3DescSection.locator("input").fill("Section heading");
  await item3DescSection.locator("textarea").fill("Additional notes for this section");

  // Save and generate a document to confirm all three item types persist correctly
  await page.getByRole("button", { name: "Angebot speichern" }).click();
  await expect(page.getByText("Ein neues Angebot wurde erstellt.")).toBeVisible();

  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:")).toBeVisible();

  // Clean up: delete document, offer, and order
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Line Items Test " + timestamp);
  await expect(page.getByText(/Angebot - A/)).toHaveCount(1);
  await page.getByText(/Angebot - A/).first().locator("../..").getByRole("button", { name: "Löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Dokument wurde gelöscht")).toBeVisible();

  await page.goto(getOrderListPath());
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.waitForURL("**/orders/**/edit");

  await expect(page.getByRole("tab", { name: "Angebot" })).toBeVisible();
  await page.getByRole("tab", { name: "Angebot" }).click();
  await page.getByRole("button", { name: "Angebot löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Angebot wurde gelöscht.")).toBeVisible();

  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();
});
