import { expect, test } from "@playwright/test";

import { getDocumentListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("create, issue document for, and delete an invoice", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // Create an order to work with
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill("Invoice Test " + timestamp);
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

  // Create an invoice
  await page.getByRole("button", { name: "Rechnung erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Neue Rechnung" })).toBeVisible();
  await page.getByRole("tab", { name: "Neue Rechnung" }).click();

  // Add a line item
  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt")).toBeVisible();

  // Fill in line item fields
  await page.getByLabel("Titel").fill("Scaffolding work");
  await page.getByLabel("Bezeichnung").fill("Scaffolding work description");
  const amountSection = page.locator('[data-name="amount"]');
  await amountSection.locator("input").nth(0).pressSequentially("10");
  await amountSection.locator("input").nth(1).fill("m2");
  await amountSection.locator("input").nth(2).pressSequentially("50");

  // Add a service date (required by invoice validation) — use the calendar UI
  // because PrimeVue DatePicker does not update its v-model via fill()
  await page.getByRole("button", { name: "Leistungsdatum" }).click();
  await page.locator("#service-date-1 input").click();
  await expect(page.locator('[data-p-today="true"]')).toBeVisible();
  await page.locator('[data-p-today="true"]').click();

  // Save the invoice
  await page.getByRole("button", { name: "Rechnung speichern" }).click();
  await expect(page.getByText("Eine neue Rechnung wurde erstellt.")).toBeVisible();

  // Create an invoice document
  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:")).toBeVisible();

  // Navigate to the document and verify it is accessible
  await page.getByRole("button", { name: "Link zum Dokument" }).click();
  await page.waitForURL("**/documents/**");
  await expect(page.getByText("Rechnung", { exact: true })).toBeVisible();

  // Go to document list and delete the invoice document
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Invoice Test " + timestamp);
  await expect(page.getByText(/Rechnung -/)).toHaveCount(1);
  const docCard = page.getByText(/Rechnung -/).first();
  await expect(docCard).toBeVisible();
  await docCard.locator("../..").getByRole("button", { name: "Löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Dokument wurde gelöscht")).toBeVisible();

  // Navigate back to order and delete the invoice
  await page.goto(getOrderListPath());
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.waitForURL("**/orders/**/edit");

  await expect(page.getByRole("tab", { name: /Rechnung/ })).toBeVisible();
  await page.getByRole("tab", { name: /Rechnung/ }).click();
  await page.getByRole("button", { name: "Rechnung löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Die Rechnung wurde gelöscht.")).toBeVisible();

  // Clean up: delete the order
  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();
});
