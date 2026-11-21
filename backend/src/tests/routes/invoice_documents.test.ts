import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { ErrorCode } from "@/global/types/backendTypes";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import {
  getClient,
  getInvoice,
  getInvoiceDocument,
  getOrder,
  getOverdueNotice,
} from "@/tests/factories";

describe("invoiceDocuments routes", () => {
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

  test("cannot delete not existing entity", async () => {
    const response = await fetch(
      getRequest(server, `api/documents/invoices/abc`, { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe(ErrorCode.ENTITY_NOT_FOUND);
  });

  test("cannot delete invoice document used in overdueNotice", async () => {
    const invoiceDocument = await getInvoiceDocument({}, appDataSource);
    await getOverdueNotice({ invoice_documents: [invoiceDocument] }, appDataSource);

    const response = await fetch(
      getRequest(server, `api/documents/invoices/${invoiceDocument.id}`, { method: "DELETE" }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe(ErrorCode.FK_CONSTRAINT_OVERDUE_NOTICE);
  });

  test("creates invoice document snapshotting client country, vat_id and reverse_vat", async () => {
    const client = getClient({
      country: "AT",
      vat_id: "ATU12345",
      reverse_vat: true,
    });
    const order = await getOrder({ client }, appDataSource);
    const invoice = await getInvoice({ order, order_id: order.id }, appDataSource);

    const response = await fetch(
      getRequest(server, `api/orders/invoices/${invoice.id}/documents`, { method: "POST" }),
    );

    expect(response.status).toBe(200);
    const document = await response.json();
    expect(document.client_country).toBe("AT");
    expect(document.client_vat_id).toBe("ATU12345");
    expect(document.client_reverse_vat).toBe(true);
    expect(document).not.toHaveProperty("reverse_vat");
  });
});
