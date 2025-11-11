import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { USER_ADMIN_NAME, USER_EMPLOYEE_NAME } from "@/config";
import { closeDatabase, initializeAppDataSource } from "@/db";
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

  test("get a specific order for different roles with different joins", async () => {
    const order = await getOrder({}, appDataSource);
    await getOffer({ order }, appDataSource);
    await getInvoice({ order }, appDataSource);
    await getOverdueNotice({ order }, appDataSource);

    const adminResponse = await fetch(
      getRequest(server, `api/orders/${order.id}`, { userName: USER_ADMIN_NAME }),
    );

    expect(adminResponse.status).toBe(200);

    const adminResponseData = await adminResponse.json();
    expect(adminResponseData.offer).toBeTruthy();
    expect(adminResponseData.invoices.length).toBeGreaterThan(0);
    expect(adminResponseData.overdue_notices.length).toBeGreaterThan(0);

    const employeeResponse = await fetch(
      getRequest(server, `api/orders/${order.id}`, { userName: USER_EMPLOYEE_NAME }),
    );

    expect(employeeResponse.status).toBe(200);

    const employeeResponseData = await employeeResponse.json();
    expect(employeeResponseData.offer).toBeUndefined();
    expect(employeeResponseData.invoices).toBeUndefined();
    expect(employeeResponseData.overdue_notices).toBeUndefined();
  });
});
