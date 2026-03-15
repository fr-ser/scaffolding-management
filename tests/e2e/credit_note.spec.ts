import { expect, test } from "@playwright/test";

import { getDocumentListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("create, issue document for, and delete a credit note", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // Create an order to work with
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill("Credit Note Test " + timestamp);
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

  // Create a credit note
  await page.getByRole("button", { name: "Gutschrift erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Neue Gutschrift" })).toBeVisible();
  await page.getByRole("tab", { name: "Neue Gutschrift" }).click();

  // Add a line item
  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt")).toBeVisible();

  // Fill in line item fields
  await page.getByLabel("Titel").fill("Scaffolding work");
  await page.getByLabel("Bezeichnung").fill("Scaffolding work description");
  const amountSection = page.locator('[data-name="amount"]');
  await amountSection.locator("input").nth(0).pressSequentially("10"); // quantity (InputNumber)
  await amountSection.locator("input").nth(1).fill("m²"); // unit (InputText)
  await amountSection.locator("input").nth(2).pressSequentially("50"); // price (InputNumber)

  // Save the credit note
  await page.getByRole("button", { name: "Gutschrift speichern" }).click();
  await expect(page.getByText("Eine neue Gutschrift wurde erstellt.")).toBeVisible();

  // Create a credit note document
  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:")).toBeVisible();

  // Navigate to the document and verify it shows the credit note type label
  await page.getByRole("button", { name: "Link zum Dokument" }).click();
  await page.waitForURL("**/documents/**");
  await expect(page.getByText("Gutschrift", { exact: true })).toBeVisible();

  // Go to document list and delete the credit note document
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Credit Note Test " + timestamp);
  const docCard = page.getByText(/Gutschrift - G/).first();
  await expect(docCard).toBeVisible();
  await docCard.locator("../..").getByRole("button", { name: "Löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Dokument wurde gelöscht")).toBeVisible();

  // Navigate back to order and delete the credit note
  await page.goto(getOrderListPath());
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.waitForURL("**/orders/**/edit");

  await expect(page.getByRole("tab", { name: /Gutschrift/ })).toBeVisible();
  await page.getByRole("tab", { name: /Gutschrift/ }).click();
  await page.getByRole("button", { name: "Gutschrift löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Die Gutschrift wurde gelöscht.")).toBeVisible();

  // Clean up: delete the order
  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();
});
