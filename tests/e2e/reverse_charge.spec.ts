import { expect, test } from "@playwright/test";

import { getClientListPath, getOrderListPath } from "../../frontend/src/helpers/routes";

test("issue an invoice for a reverse-charge client", async ({ page }) => {
  const name = `Reverse Charge ${Date.now()}`;
  await page.goto(getClientListPath());
  await page.getByTestId("client-create-button").click();
  await page.getByLabel("Firma").fill(name);
  await page.getByLabel("Land").fill("AT");
  await page.getByLabel("USt-IdNr. / Steuer-Nr.").fill("ATU12345");
  await page.getByLabel("Reverse Charge (Steuerschuldnerschaft des Leistungsempfängers)").check();
  await page.getByLabel("Speichern").click();
  await expect(page.getByText("Ein neuer Kunde wurde erstellt")).toBeVisible();

  await page.goto(getOrderListPath());
  await page.getByTestId("order-create-button").click();
  await page.getByLabel("Bauvorhaben").fill(name);
  await page.getByTestId("order-client-select").locator("input").fill(name);
  await page.getByRole("option").first().click();
  await expect(page.getByText("Reverse Charge (ohne MwSt.)")).toBeVisible();
  await page.getByTestId("order-save-button").click();
  await page.waitForURL("**/orders");
  await page.getByTestId("order-search-input").fill(name);
  const orderCard = page.getByTestId("order-card").filter({ hasText: name });
  await expect(orderCard).toHaveCount(1);
  await orderCard.getByLabel("Anschauen / Bearbeiten").click();
  await expect(page.getByText("Reverse Charge (ohne MwSt.)")).toBeVisible();

  await page.getByRole("button", { name: "Rechnung erstellen" }).click();
  await page.getByRole("tab", { name: "Neue Rechnung" }).click();
  await page.getByRole("button", { name: "Artikel" }).click();
  const description = page.locator('[data-name="description"]').first();
  await description.locator("input").fill("Work");
  await description.locator("textarea").fill("Scaffolding work");
  const amount = page.locator('[data-name="amount"]');
  await amount.locator("input").nth(0).pressSequentially("10");
  await amount.locator("input").nth(1).fill("m2");
  await amount.locator("input").nth(2).pressSequentially("50");
  await expect(page.getByText("USt: -")).toBeVisible();
  await expect(page.getByText("Brutto: -", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Leistungsdatum" }).click();
  await page.locator("#service-date-1 input").click();
  await page.locator('[data-p-today="true"]').click();
  await page.getByRole("button", { name: "Rechnung speichern" }).click();
  await expect(page.getByText("Eine neue Rechnung wurde erstellt.")).toBeVisible();
  await page.getByRole("button", { name: "Dokument Erstellen" }).click();
  await page.getByRole("alertdialog").getByText("Bestätigen").click();
  await page.getByRole("button", { name: "Link zum Dokument" }).click();
  await page.waitForURL("**/documents/**");
  await expect(page.getByText("Österreich", { exact: true })).toBeVisible();
  await expect(page.getByText("USt-IdNr.: ATU12345")).toBeVisible();
  const itemCells = page.locator(".item-table tbody tr").first().locator("td");
  await expect(itemCells.nth(5)).toHaveText("-");
  await expect(itemCells.nth(6)).toHaveText("-");
  await expect(itemCells.nth(7)).toHaveText("-");
  const totals = page.locator(".sum-table tbody tr").nth(1).locator("td");
  await expect(totals.nth(0)).toContainText("500,00");
  await expect(totals.nth(1)).toHaveText("-");
  await expect(totals.nth(2)).toHaveText("-");
  await expect(
    page.getByText("Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)"),
  ).toBeVisible();
});
