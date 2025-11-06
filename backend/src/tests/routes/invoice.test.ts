import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { InvoiceDocument } from "@/db/entities/documents";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { getInvoice, getInvoiceDocument } from "@/tests/factories";

describe("invoice routes", () => {
  let app: Express;
  let server: Server;
  let appDataSource: DataSource;
  const temporaryDirectory = mkdtempSync(path.join(os.tmpdir(), "test-"));

  beforeAll(async () => {
    appDataSource = await initializeAppDataSource(path.join(temporaryDirectory, "test.db"));
    await appDataSource.runMigrations({ transaction: "all" });

    app = getApp();
    server = await new Promise((resolve) => {
      const server = app.listen(0, () => resolve(server));
    });
  });

  afterAll(async () => {
    server.close();
    await closeDatabase();
    await rm(temporaryDirectory, { recursive: true });
  });

  test.each(["R-2023-12-01", "R2023-12-01", "2023-12-01"])(
    "use correct new document ID: %s",
    async (id) => {
      // given
      await appDataSource.manager.clear(InvoiceDocument);
      await getInvoiceDocument({ id }, appDataSource);
      const invoice = await getInvoice({ invoice_date: "2023-12-12" }, appDataSource);

      // when
      const response = await fetch(
        getRequest(server, `api/orders/invoices/${invoice.id}/documents`, { method: "POST" }),
      );

      // then
      expect(response.status).toBe(200);
      const newDocument = await appDataSource.manager.findOne(InvoiceDocument, {
        where: { id: "2023-12-02" },
      });
      expect(newDocument).toBeTruthy();
    },
  );

  test("should use the first unused document number for the month", async () => {
    // given
    await appDataSource.manager.clear(InvoiceDocument);
    await getInvoiceDocument({ id: "2025-11-01" }, appDataSource);
    await getInvoiceDocument({ id: "2025-11-03" }, appDataSource);
    const invoice = await getInvoice({ invoice_date: "2025-11-06" }, appDataSource);

    // when
    const response = await fetch(
      getRequest(server, `api/orders/invoices/${invoice.id}/documents`, { method: "POST" }),
    );

    // then
    expect(response.status).toBe(200);
    const newDocument = await appDataSource.manager.findOne(InvoiceDocument, {
      where: { id: "2025-11-02" },
    });
    expect(newDocument).toBeTruthy();
  });
});
