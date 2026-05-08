import { expect, test } from "@playwright/test";

import { getDocumentListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("create, issue document for, and delete an overdue notice", async ({ page }) => {
  await page.goto(getOrderListPath());

  const timestamp = String(Date.now());

  // Create an order to work with
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill("Overdue Notice Test " + timestamp);
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

  // Create an invoice with a line item and service date — required as the
  // overdue notice's referenced invoice document
  await page.getByRole("button", { name: "Rechnung erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Neue Rechnung" })).toBeVisible();
  await page.getByRole("tab", { name: "Neue Rechnung" }).click();

  await page.getByRole("button", { name: "Artikel" }).click();
  await expect(page.getByText("Artikel hinzugefügt")).toBeVisible();

  await page.getByLabel("Titel").fill("Scaffolding work");
  await page.getByLabel("Bezeichnung").fill("Scaffolding work description");
  const amountSection = page.locator('[data-name="amount"]');
  await amountSection.locator("input").nth(0).pressSequentially("10");
  await amountSection.locator("input").nth(1).fill("m2");
  await amountSection.locator("input").nth(2).pressSequentially("50");

  await page.getByRole("button", { name: "Leistungsdatum" }).click();
  await page.locator("#service-date-1 input").click();
  await expect(page.locator('[data-p-today="true"]')).toBeVisible();
  await page.locator('[data-p-today="true"]').click();

  await page.getByRole("button", { name: "Rechnung speichern" }).click();
  await expect(page.getByText("Eine neue Rechnung wurde erstellt.")).toBeVisible();

  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:")).toBeVisible();

  // Create an overdue notice and link the invoice document
  await page.getByRole("button", { name: "Mahnung erstellen" }).click();
  await expect(page.getByRole("tab", { name: "Neue Mahnung" })).toBeVisible();
  await page.getByRole("tab", { name: "Neue Mahnung" }).click();

  await page.getByRole("button", { name: "Rechnung hinzufügen" }).click();
  const invoiceDialog = page.getByRole("dialog");
  await expect(invoiceDialog).toBeVisible();
  // Wait for invoice documents to load, then click the first one
  await expect(invoiceDialog.locator(".cursor-pointer").first()).toBeVisible();
  await invoiceDialog.locator(".cursor-pointer").first().click();

  // Save the overdue notice
  await page.getByRole("button", { name: "Mahnung speichern" }).click();
  await expect(page.getByText("Eine neue Mahnung wurde erstellt.")).toBeVisible();

  // Create an overdue notice document
  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Ein Dokumente wurde erstellt:").last()).toBeVisible();

  // Navigate to the document and verify it is accessible
  await page.getByRole("button", { name: "Link zum Dokument" }).last().click();
  await page.waitForURL("**/documents/**");
  await expect(page.getByText(/Mahnung/)).toBeVisible();

  // Go to document list and delete the overdue notice document first
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Overdue Notice Test " + timestamp);
  await expect(page.getByText(/Mahnung - M/)).toHaveCount(1);
  const overdueNoticeDocCard = page.getByText(/Mahnung - M/).first();
  await expect(overdueNoticeDocCard).toBeVisible();
  await overdueNoticeDocCard.locator("../..").getByRole("button", { name: "Löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Dokument wurde gelöscht")).toBeVisible();

  // Delete the overdue notice sub-order (removes the FK reference to the invoice document)
  await page.goto(getOrderListPath());
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").getByLabel("Anschauen / Bearbeiten").click();
  await page.waitForURL("**/orders/**/edit");

  await expect(page.getByRole("tab", { name: /Mahnung/ })).toBeVisible();
  await page.getByRole("tab", { name: /Mahnung/ }).click();
  await page.getByRole("button", { name: "Mahnung löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Die Mahnung wurde gelöscht.")).toBeVisible();

  // Now delete the invoice document (safe to do now that no overdue notice references it)
  await page.goto(getDocumentListPath());
  await page.getByPlaceholder("Suche").fill("Overdue Notice Test " + timestamp);
  await expect(page.getByText(/Rechnung -/)).toHaveCount(1);
  const invoiceDocCard = page.getByText(/Rechnung -/).first();
  await expect(invoiceDocCard).toBeVisible();
  await invoiceDocCard.locator("../..").getByRole("button", { name: "Löschen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Das Dokument wurde gelöscht")).toBeVisible();

  // Delete the invoice sub-order and the order
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

  await page.getByTestId("order-return-button").click();
  await page.getByTestId("order-search-input").fill(timestamp);
  await expect(page.getByTestId("order-card")).toHaveCount(1);
  await page.getByTestId("order-card").first().getByTestId("order-delete-button").click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await expect(page.getByText("Der Auftrag wurde gelöscht")).toBeVisible();
});
