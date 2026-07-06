import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { OverdueNotice as DbOverdueNotice } from "@/db/entities/overdue_notice";
import { OverdueNoticeLevel, OverdueNoticePaymentStatus } from "@/global/types/appTypes";
import { OverdueNoticeCreate } from "@/global/types/dataEditTypes";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { getInvoiceDocument, getOrder } from "@/tests/factories";

describe("overdue notice routes", () => {
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

  test("links the given invoice documents when creating an overdue notice", async () => {
    // given
    const order = await getOrder({}, appDataSource);
    const invoiceDocument = await getInvoiceDocument({ order_id: order.id }, appDataSource);
    const payload: OverdueNoticeCreate = {
      order_id: order.id,
      description: "Description",
      notice_date: "2021-01-01",
      payments_until: "2022-01-02",
      payment_target: "2022-01-03",
      payment_status: OverdueNoticePaymentStatus.initial,
      notice_level: OverdueNoticeLevel.first,
      notice_costs: 1,
      default_interest: 2,
      invoice_documents: [invoiceDocument.id],
    };

    // when
    const response = await fetch(
      getRequest(server, "api/orders/overdue_notices", { method: "POST", body: payload }),
    );

    // then
    expect(response.status).toBe(200);
    const createdId = (await response.json()).id;
    const overdueNotice = await appDataSource.manager.findOne(DbOverdueNotice, {
      where: { id: createdId },
      relations: { invoice_documents: true },
    });
    expect(overdueNotice?.invoice_documents.map((document) => document.id)).toEqual([
      invoiceDocument.id,
    ]);
  });
});
