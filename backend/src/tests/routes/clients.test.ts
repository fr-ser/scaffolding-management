import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { Server } from "node:http";
import os from "node:os";
import path from "node:path";

import { Express } from "express";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { closeDatabase, initializeAppDataSource } from "@/db";
import { Client } from "@/db/entities/client";
import { getApp } from "@/main";
import { getRequest } from "@/tests/api-utils";
import { getClient } from "@/tests/factories";

describe("Clients routes", () => {
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

  test("search for clients", async () => {
    await appDataSource
      .getRepository(Client)
      .save([getClient(), getClient({ first_name: "Test", last_name: "User" })]);

    const fullResponse = await fetch(getRequest(server, "api/clients"));

    expect(fullResponse.status).toBe(200);

    const fullResponseData = await fullResponse.json();
    expect(fullResponseData.data).toHaveLength(2);
    expect(fullResponseData.totalCount).toBe(2);

    // search with a filter
    const filteredResponse = await fetch(
      getRequest(server, "api/clients", { params: { search: "st us" } }),
    );

    expect(filteredResponse.status).toBe(200);

    const filteredResponseData = await filteredResponse.json();
    expect(filteredResponseData.data).toHaveLength(1);
    expect(filteredResponseData.totalCount).toBe(1);
  });
});
