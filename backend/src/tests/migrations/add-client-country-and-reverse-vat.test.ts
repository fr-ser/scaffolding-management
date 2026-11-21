import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { getDataSourceConfig } from "@/db/dataSource";
import { Init1725292732890 } from "@/migrations/1725292732890-init";
import { AddCreditNote1742036000000 } from "@/migrations/1742036000000-add-credit-note";
import { AllowMultipleOffersPerOrder1760000000000 } from "@/migrations/1760000000000-allow-multiple-offers-per-order";
import { EnforceSingleDocumentPerInvoiceNotice1780420000000 } from "@/migrations/1780420000000-enforce-single-document-per-invoice-notice";
import { AddClientCountryAndReverseVat1785000000000 } from "@/migrations/1785000000000-add-client-country-and-reverse-vat";

type TableInfoRow = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

describe("add client country and reverse vat migration", () => {
  const temporaryDirectory = mkdtempSync(path.join(os.tmpdir(), "test-"));
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...getDataSourceConfig(path.join(temporaryDirectory, "test.db")),
      migrations: [
        Init1725292732890,
        AddCreditNote1742036000000,
        AllowMultipleOffersPerOrder1760000000000,
        EnforceSingleDocumentPerInvoiceNotice1780420000000,
        AddClientCountryAndReverseVat1785000000000,
      ],
    });
    await dataSource.initialize();
    await dataSource.createQueryRunner().query("PRAGMA foreign_keys=ON");
    await dataSource.runMigrations({ transaction: "all" });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await rm(temporaryDirectory, { recursive: true });
  });

  test("adds country, reverse_vat and vat_id to client table with defaults", async () => {
    const tableInfo = (await dataSource.query(`PRAGMA table_info("client")`)) as TableInfoRow[];

    const countryCol = tableInfo.find((col) => col.name === "country");
    const reverseVatCol = tableInfo.find((col) => col.name === "reverse_vat");
    const vatIdCol = tableInfo.find((col) => col.name === "vat_id");

    expect(countryCol).toBeDefined();
    expect(countryCol?.dflt_value).toBe("'DE'");
    expect(countryCol?.notnull).toBe(1);

    expect(reverseVatCol).toBeDefined();
    expect(reverseVatCol?.dflt_value).toBe("0");
    expect(reverseVatCol?.notnull).toBe(1);

    expect(vatIdCol).toBeDefined();
    expect(vatIdCol?.notnull).toBe(0);
  });

  test("adds client_country, client_reverse_vat and client_vat_id to document tables with defaults", async () => {
    const documentTables = [
      "invoice_document",
      "offer_document",
      "credit_note_document",
      "overdue_notice_document",
    ];

    for (const table of documentTables) {
      const tableInfo = (await dataSource.query(`PRAGMA table_info("${table}")`)) as TableInfoRow[];

      const countryCol = tableInfo.find((col) => col.name === "client_country");
      const reverseVatCol = tableInfo.find((col) => col.name === "client_reverse_vat");
      const vatIdCol = tableInfo.find((col) => col.name === "client_vat_id");

      expect(countryCol).toBeDefined();
      expect(countryCol?.dflt_value).toBe("'DE'");
      expect(countryCol?.notnull).toBe(1);

      expect(reverseVatCol).toBeDefined();
      expect(reverseVatCol?.dflt_value).toBe("0");
      expect(reverseVatCol?.notnull).toBe(1);
      expect(tableInfo.find((col) => col.name === "reverse_vat")).toBeUndefined();

      expect(vatIdCol).toBeDefined();
      expect(vatIdCol?.notnull).toBe(0);
    }
  });

  test("down migration drops added columns", async () => {
    const migration = new AddClientCountryAndReverseVat1785000000000();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      await migration.down(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    const tableInfo = (await dataSource.query(`PRAGMA table_info("client")`)) as TableInfoRow[];

    expect(tableInfo.find((col) => col.name === "country")).toBeUndefined();
    expect(tableInfo.find((col) => col.name === "reverse_vat")).toBeUndefined();
    expect(tableInfo.find((col) => col.name === "vat_id")).toBeUndefined();
    const tables = [
      "invoice_document",
      "offer_document",
      "credit_note_document",
      "overdue_notice_document",
    ];
    for (const table of tables) {
      const columns = (await dataSource.query(`PRAGMA table_info("${table}")`)) as TableInfoRow[];
      expect(columns.find((col) => col.name === "client_country")).toBeUndefined();
      expect(columns.find((col) => col.name === "client_reverse_vat")).toBeUndefined();
      expect(columns.find((col) => col.name === "client_vat_id")).toBeUndefined();
    }
  });
});
