import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { UserRole } from "@/global/types/backendTypes";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
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

  afterAll(async () => {
    server.close();
    await closeDatabase();
    await rm(temporaryDirectory, { recursive: true });
  });

  test("get order as for different roles", async () => {
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
