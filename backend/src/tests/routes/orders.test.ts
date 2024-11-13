import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { OfferStatus, OverdueNoticePaymentStatus, PaymentStatus } from "@/global/types/appTypes";
import { UserRole } from "@/global/types/backendTypes";
import { Order } from "@/global/types/entities";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { clearDatabase } from "@/tests/db";
import { getInvoice, getOffer, getOrder, getOverdueNotice } from "@/tests/factories";

describe("Orders routes", () => {
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

  test("get orders by search", async () => {
    await getOrder({}, appDataSource); // this order should not be found
    const orderFoundById = await getOrder({ id: "A100" }, appDataSource);
    const orderFoundByTitle = await getOrder({ title: "pre A100 post" }, appDataSource);

    const response = await fetch(getRequest(server, `api/orders`, { params: { search: "A100" } }));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(2);
    expect(new Set(responseData.data.map((order: Order) => order.id))).toEqual(
      new Set([orderFoundById.id, orderFoundByTitle.id]),
    );
  });

  test("get orders by overdue filter for overdue notices", async () => {
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

    const response = await fetch(getRequest(server, `api/orders`, { params: { overdue: "true" } }));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(1);
    expect(responseData.data[0].id).toBe(invoiceToFind.order.id);
    expect(responseData.data[0].overdue_notices.length).toBe(1);
    expect(responseData.data[0].overdue_notices[0].id).toBe(invoiceToFind.id);
  });

  test("get orders by overdue filter for invoices", async () => {
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

    const response = await fetch(getRequest(server, `api/orders`, { params: { overdue: "true" } }));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(1);
    expect(responseData.data[0].id).toBe(invoiceToFind.order.id);
    expect(responseData.data[0].invoices.length).toBe(1);
    expect(responseData.data[0].invoices[0].id).toBe(invoiceToFind.id);
  });

  test("get orders by overdue filter for offers", async () => {
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

    const response = await fetch(getRequest(server, `api/orders`, { params: { overdue: "true" } }));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(1);
    expect(responseData.data[0].id).toBe(offerToFind.order_id);
    expect(responseData.data[0].offer.id).toBe(offerToFind.id);
  });

  test("get orders with only overdue items for the overdue filter", async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const offerToFind = await getOffer(
      { status: OfferStatus.created, offer_valid_until: yesterday },
      appDataSource,
    );
    await getInvoice({ order: offerToFind.order }, appDataSource);

    const response = await fetch(getRequest(server, `api/orders`, { params: { overdue: "true" } }));

    expect(response.status).toBe(200);

    const responseData = await response.json();

    expect(responseData.totalCount).toBe(1);
    expect(responseData.data[0].id).toBe(offerToFind.order_id);
    expect(responseData.data[0].offer.id).toBe(offerToFind.id);
    expect(responseData.data[0].invoices.length).toBe(0);
  });

  test("get a specific order for different roles with different joins", async () => {
    const order = await getOrder({}, appDataSource);
    await getOffer({ order }, appDataSource);
    await getInvoice({ order }, appDataSource);
    await getOverdueNotice({ order }, appDataSource);

    const adminResponse = await fetch(
      getRequest(server, `api/orders/${order.id}`, { userRole: UserRole.admin }),
    );

    expect(adminResponse.status).toBe(200);

    const adminResponseData = await adminResponse.json();
    expect(adminResponseData.offer).toBeTruthy();
    expect(adminResponseData.invoices.length).toBeGreaterThan(0);
    expect(adminResponseData.overdue_notices.length).toBeGreaterThan(0);

    const employeeResponse = await fetch(
      getRequest(server, `api/orders/${order.id}`, { userRole: UserRole.employee }),
    );

    expect(employeeResponse.status).toBe(200);

    const employeeResponseData = await employeeResponse.json();
    expect(employeeResponseData.offer).toBeUndefined();
    expect(employeeResponseData.invoices).toBeUndefined();
    expect(employeeResponseData.overdue_notices).toBeUndefined();
  });
});
