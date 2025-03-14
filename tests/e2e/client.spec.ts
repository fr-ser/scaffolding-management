import { expect, test } from "@playwright/test";

import { getClientListPath } from "../../frontend/src/helpers/routes";

test("create, edit and delete a client", async ({ page }) => {
  await page.goto(getClientListPath());

  const timestamp = String(Date.now());

  // create
  await page.getByTestId("client-create-button").click();

  await page.getByLabel("Anrede").click();
  await page.getByRole("option", { name: "Herr Dr." }).click();
  await page.getByLabel("Vorname").fill("test first name");
  await page.getByLabel("Nachname").fill("test last name " + timestamp);
  await page.getByLabel("Straße und Nr.").fill("test street");
  await page.getByLabel("PLZ").fill("test postal code");
  await page.getByLabel("Stadt").fill("test city");

  await page.getByLabel("Speichern").click();
  await expect(page.getByText("Ein neuer Kunde wurde erstellt")).toBeVisible();

  const firstClientCard = page.getByTestId("client-card").first();
  await expect(firstClientCard).toContainText(timestamp);

  // edit
  await firstClientCard.getByLabel("Anschauen / Bearbeiten").click();
  await page.getByLabel("Kommentar").fill("edit comment");
  await page.getByLabel("Speichern").click();
  await expect(page.getByText("Die Änderung der Kundendaten wurde gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Kommentar")).toHaveValue("edit comment");

  // check filtering
  await page.getByTestId("return-button").click();
  await page.getByTestId("client-search-input").fill(timestamp);
  await page.waitForTimeout(300); // debounce time
  await expect(page.getByText(timestamp)).toBeVisible();
  expect(await page.getByTestId("client-card").count()).toBe(1);

  // delete
  await page
    .getByTestId("client-card")
    .filter({ hasText: timestamp })
    .getByLabel("Löschen")
    .click();

  await page.getByRole("alertdialog").getByText("Löschen").click();
  await expect(page.getByText("Der Kunde wurde gelöscht")).toBeVisible();
  await expect(page.getByText(timestamp)).not.toBeVisible();
});
