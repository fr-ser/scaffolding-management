import { mkdtempSync } from "node:fs";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { OverdueNoticeDocument } from "@/db/entities/documents";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";

import { getOverdueNotice, getOverdueNoticeDocument } from "../factories";

describe("overdue notice document routes", () => {
  let app: Express;
  let server: Server;
  let appDataSource: DataSource;
  const temporaryDirectory = mkdtempSync(path.join(os.tmpdir(), "test-"));

  beforeAll(async () => {
    appDataSource = await initializeAppDataSource(path.join(temporaryDirectory, "test.db"));
    await appDataSource.runMigrations({ transaction: "all" });
    app = getApp();
    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
  });

  afterAll(async () => {
    server.close();
    await closeDatabase();
  });

  test("creates a new overdue notice document with correct ID when one already exists", async () => {
    // given
    await appDataSource.manager.clear(OverdueNoticeDocument);
    await getOverdueNoticeDocument({ id: "M2025-11-01" }, appDataSource);
    const offer = await getOverdueNotice({ notice_date: "2025-11-12" }, appDataSource);

    // when
    const response = await fetch(
      getRequest(server, `api/orders/overdue_notices/${offer.id}/documents`, { method: "POST" }),
    );

    // then
    expect(response.status).toBe(200);
    const newDocument = await appDataSource.manager.findOne(OverdueNoticeDocument, {
      where: { id: "M2025-11-02" },
    });
    expect(newDocument).toBeTruthy();
  });
});
