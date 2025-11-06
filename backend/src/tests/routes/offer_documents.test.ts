import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { OfferDocument } from "@/db/entities/documents";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { getOffer, getOfferDocument } from "@/tests/factories";

describe("offer document routes", () => {
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

  test("creates a new offer document with correct ID when one already exists", async () => {
    // given
    await appDataSource.manager.clear(OfferDocument);
    await getOfferDocument({ id: "A2025-11-01" }, appDataSource);
    const offer = await getOffer({ offered_at: "2025-11-12" }, appDataSource);

    // when
    const response = await fetch(
      getRequest(server, `api/orders/offers/${offer.id}/documents`, { method: "POST" }),
    );

    // then
    expect(response.status).toBe(200);
    const newDocument = await appDataSource.manager.findOne(OfferDocument, {
      where: { id: "A2025-11-02" },
    });
    expect(newDocument).toBeTruthy();
  });
});
