import { expect, test } from "@playwright/test";

test("create, edit and delete a client", async ({ page }) => {
  await page.goto("/client");

  const timestamp = String(Date.now());

  // create client
  await page.getByLabel("Neuen Kunden erstellen").click();

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

  // edit client
  await firstClientCard.click();
  await page.getByLabel("Kommentar").fill("edit comment");
  await page.getByLabel("Speichern").click();
  await expect(page.getByText("Die Änderung der Kundendaten wurde gespeichert")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Kommentar")).toHaveValue("edit comment");

  // delete client
  await page.getByTestId("return-button").click();
  await expect(page.getByText(timestamp)).toBeVisible();

  await page
    .getByTestId("client-card")
    .filter({ hasText: timestamp })
    .getByLabel("Löschen")
    .click();

  await page.getByRole("alertdialog").getByText("Löschen").click();
  await expect(page.getByText("Der Kunde wurde gelöscht")).toBeVisible();
  await expect(page.getByText(timestamp)).not.toBeVisible();
});
