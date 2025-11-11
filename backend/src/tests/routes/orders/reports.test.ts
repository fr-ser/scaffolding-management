import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import {
  OfferStatus,
  OrderStatus,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { clearDatabase } from "@/tests/db";
import { getInvoice, getOffer, getOrder, getOverdueNotice } from "@/tests/factories";

describe("Order report routes", () => {
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

  afterEach(async () => {
    await clearDatabase(appDataSource);
  });

  afterAll(async () => {
    server.close();
    await closeDatabase();
    await rm(temporaryDirectory, { recursive: true });
  });

  describe("overdue report", () => {
    test("get orders for overdue notices", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const invoiceToFind = await getOverdueNotice(
        {
          payment_status: OverdueNoticePaymentStatus.partiallyPaid,
          payment_target: yesterday,
        },
        appDataSource,
      );
      await getOverdueNotice(
        { payment_status: OverdueNoticePaymentStatus.partiallyPaid, payment_target: tomorrow },
        appDataSource,
      ); // this invoice should not be found because the due date is not there yet
      await getOverdueNotice({ payment_status: OverdueNoticePaymentStatus.initial }, appDataSource); // this invoice should not be found
      await getOverdueNotice({ payment_status: OverdueNoticePaymentStatus.paid }, appDataSource); // this invoice should not be found

      const response = await fetch(getRequest(server, `api/orders/reports/overdue-orders`));

      expect(response.status).toBe(200);

      const responseData = await response.json();

      expect(responseData.totalCount).toBe(1);
      expect(responseData.data[0].id).toBe(invoiceToFind.order.id);
      expect(responseData.data[0].overdue_notices.length).toBe(1);
      expect(responseData.data[0].overdue_notices[0].id).toBe(invoiceToFind.id);
    });

    test("get orders for invoices", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const invoiceToFind = await getInvoice(
        { status: PaymentStatus.open, payment_target: yesterday },
        appDataSource,
      );
      await getInvoice({ status: PaymentStatus.open, payment_target: tomorrow }, appDataSource); // this invoice should not be found because the due date is not there yet
      await getInvoice({ status: PaymentStatus.initial }, appDataSource); // this invoice should not be found
      await getInvoice({ status: PaymentStatus.paid }, appDataSource); // this invoice should not be found

      const response = await fetch(getRequest(server, `api/orders/reports/overdue-orders`));

      expect(response.status).toBe(200);

      const responseData = await response.json();

      expect(responseData.totalCount).toBe(1);
      expect(responseData.data[0].id).toBe(invoiceToFind.order.id);
      expect(responseData.data[0].invoices.length).toBe(1);
      expect(responseData.data[0].invoices[0].id).toBe(invoiceToFind.id);
    });

    test("get orders for offers", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const offerToFind = await getOffer(
        { status: OfferStatus.created, offer_valid_until: yesterday },
        appDataSource,
      );
      await getOffer({ status: OfferStatus.created, offer_valid_until: tomorrow }, appDataSource); // this offer should not be found because the due date is not there yet
      await getOffer({ status: OfferStatus.initial }, appDataSource); // this offer should not be found
      await getOffer({ status: OfferStatus.confirmed }, appDataSource); // this offer should not be found
      await getOffer({ status: OfferStatus.rejected }, appDataSource); // this offer should not be found

      const response = await fetch(getRequest(server, `api/orders/reports/overdue-orders`));

      expect(response.status).toBe(200);

      const responseData = await response.json();

      expect(responseData.totalCount).toBe(1);
      expect(responseData.data[0].id).toBe(offerToFind.order_id);
      expect(responseData.data[0].offer.id).toBe(offerToFind.id);
    });

    test("get orders", async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();

      const offerToFind = await getOffer(
        { status: OfferStatus.created, offer_valid_until: yesterday },
        appDataSource,
      );
      await getInvoice({ order: offerToFind.order }, appDataSource);

      const response = await fetch(getRequest(server, `api/orders/reports/overdue-orders`));

      expect(response.status).toBe(200);

      const responseData = await response.json();

      expect(responseData.totalCount).toBe(1);
      expect(responseData.data[0].id).toBe(offerToFind.order_id);
      expect(responseData.data[0].offer.id).toBe(offerToFind.id);
      expect(responseData.data[0].invoices.length).toBe(0);
    });
  });

  test("get prepared orders", async () => {
    const orderToFind = await getOrder({ status: OrderStatus.preparation }, appDataSource);
    // this order should not be found
    await getOrder({ status: OrderStatus.finished }, appDataSource);

    const response = await fetch(getRequest(server, `api/orders/reports/prepared-orders`));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(1);
    expect(responseData.data[0].id).toBe(orderToFind.id);
    expect(responseData.data[0].client).toBeTruthy();
  });
});
