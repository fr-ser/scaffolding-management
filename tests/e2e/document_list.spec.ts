import { expect, test } from "@playwright/test";

import { getDocumentListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("view a document from the document list", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // Create an order to work with
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill("Document List Test " + timestamp);
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

  // Create a credit note with a line item and generate a document
  await page.getByRole("button", { name: "Gutschrift erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Neue Gutschrift" })).toBeVisible();
  await page.getByRole("tab", { name: "Neue Gutschrift" }).click();

  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt")).toBeVisible();

  await page.getByLabel("Titel").fill("Scaffolding work");
  await page.getByLabel("Bezeichnung").fill("Scaffolding work description");
  const amountSection = page.locator('[data-name="amount"]');
  await amountSection.locator("input").nth(0).pressSequentially("10");
  await amountSection.locator("input").nth(1).fill("m2");
  await amountSection.locator("input").nth(2).pressSequentially("50");

  await page.getByRole("button", { name: "Gutschrift speichern" }).click();
  await expect(page.getByText("Eine neue Gutschrift wurde erstellt.")).toBeVisible();

  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:")).toBeVisible();

  // Navigate to document list and search for the document
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Document List Test " + timestamp);
  await expect(page.getByText(/Gutschrift - G/)).toHaveCount(1);
  const docCard = page.getByText(/Gutschrift - G/).first();
  await expect(docCard).toBeVisible();

  // Use the "Anschauen" button to navigate to the document view
  await docCard.locator("../..").getByRole("button", { name: "Anschauen" }).click();
  await page.waitForURL("**/documents/**");
  await expect(page.getByText("Gutschrift", { exact: true })).toBeVisible();

  // Return to document list and delete the document
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Document List Test " + timestamp);
  await expect(page.getByText(/Gutschrift - G/)).toHaveCount(1);
  const deleteDocCard = page.getByText(/Gutschrift - G/).first();
  await expect(deleteDocCard).toBeVisible();
  await deleteDocCard.locator("../..").getByRole("button", { name: "Löschen" }).click();
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
