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

type CountResult = {
  count: number;
};

type IdResult = {
  id: number;
};

type DescriptionResult = {
  description: string;
};

describe("enforce single document per invoice and overdue notice migration", () => {
  const temporaryDirectory = mkdtempSync(path.join(os.tmpdir(), "test-"));
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...getDataSourceConfig(path.join(temporaryDirectory, "test.db")),
      migrations: [
        Init1725292732890,
        AddCreditNote1742036000000,
        AllowMultipleOffersPerOrder1760000000000,
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

  test("splits duplicate documents onto copied source rows before adding unique indexes", async () => {
    await seedDuplicateDocumentData(dataSource);

    const migration = new EnforceSingleDocumentPerInvoiceNotice1780420000000();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    expect(await getCount(dataSource, "invoice_document")).toBe(2);
    expect(await getCount(dataSource, "overdue_notice_document")).toBe(2);
    expect(await getMaxDocumentsPerSource(dataSource, "invoice_document", "invoice_id")).toBe(1);
    expect(
      await getMaxDocumentsPerSource(dataSource, "overdue_notice_document", "overdue_notice_id"),
    ).toBe(1);

    const duplicateInvoiceId = await getDocumentSourceId(
      dataSource,
      "invoice_document",
      "invoice_id",
      "INV-2026-02",
    );
    const duplicateOverdueNoticeId = await getDocumentSourceId(
      dataSource,
      "overdue_notice_document",
      "overdue_notice_id",
      "MAHN-2026-02",
    );

    expect(duplicateInvoiceId).not.toBe(1);
    expect(duplicateOverdueNoticeId).not.toBe(1);
    expect(await getCount(dataSource, "invoice_item", "invoice_id", duplicateInvoiceId)).toBe(2);
    expect(
      await getCount(
        dataSource,
        "overdue_notice_invoice_document_junction",
        "overdue_notice_id",
        duplicateOverdueNoticeId,
      ),
    ).toBe(2);

    const [invoiceDescription] = (await dataSource.query(
      `SELECT "description" FROM "invoice" WHERE "id" = ?`,
      [duplicateInvoiceId],
    )) as DescriptionResult[];
    const [overdueNoticeDescription] = (await dataSource.query(
      `SELECT "description" FROM "overdue_notice" WHERE "id" = ?`,
      [duplicateOverdueNoticeId],
    )) as DescriptionResult[];

    expect(invoiceDescription.description).toContain("INV-2026-02");
    expect(invoiceDescription.description).toContain("Rechnung 1");
    expect(invoiceDescription.description).not.toContain("Original invoice");
    expect(overdueNoticeDescription.description).toContain("MAHN-2026-02");
    expect(overdueNoticeDescription.description).toContain("Mahnung 1");
    expect(overdueNoticeDescription.description).not.toContain("Original notice");

    await expect(
      dataSource.query(`UPDATE "invoice_document" SET "invoice_id" = 1 WHERE "id" = ?`, [
        "INV-2026-02",
      ]),
    ).rejects.toThrow(/UNIQUE/);
    await expect(
      dataSource.query(
        `UPDATE "overdue_notice_document" SET "overdue_notice_id" = 1 WHERE "id" = ?`,
        ["MAHN-2026-02"],
      ),
    ).rejects.toThrow(/UNIQUE/);
  });
});

async function getCount(
  dataSource: DataSource,
  table: string,
  column?: string,
  value?: number,
): Promise<number> {
  const whereClause = column == null ? "" : ` WHERE "${column}" = ?`;
  const parameters = value == null ? [] : [value];
  const [result] = (await dataSource.query(
    `SELECT COUNT(*) AS "count" FROM "${table}"${whereClause}`,
    parameters,
  )) as CountResult[];
  return result.count;
}

async function getMaxDocumentsPerSource(
  dataSource: DataSource,
  table: string,
  column: string,
): Promise<number> {
  const [result] = (await dataSource.query(`
    SELECT MAX("document_count") AS "count"
    FROM (
      SELECT COUNT(*) AS "document_count"
      FROM "${table}"
      GROUP BY "${column}"
    )
  `)) as CountResult[];
  return result.count;
}

async function getDocumentSourceId(
  dataSource: DataSource,
  table: string,
  sourceColumn: string,
  documentId: string,
): Promise<number> {
  const [result] = (await dataSource.query(
    `SELECT "${sourceColumn}" AS "id" FROM "${table}" WHERE "id" = ?`,
    [documentId],
  )) as IdResult[];
  return result.id;
}

async function seedDuplicateDocumentData(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    INSERT INTO "client" (
      "id",
      "created_at",
      "updated_at",
      "email",
      "first_name",
      "last_name",
      "postal_code",
      "city",
      "street_and_number"
    )
    VALUES ('K1', 1, 1, 'client@example.com', 'First', 'Last', '12345', 'City', 'Street 1')
  `);
  await dataSource.query(`
    INSERT INTO "order" (
      "id",
      "created_at",
      "updated_at",
      "client_id",
      "status",
      "title",
      "description",
      "can_have_cash_discount",
      "discount_duration",
      "discount_percentage"
    )
    VALUES ('A1', 1, 1, 'K1', 'Angebot', 'Order title', 'Order description', 0, 7, 0)
  `);
  await dataSource.query(`
    INSERT INTO "invoice" (
      "id",
      "created_at",
      "updated_at",
      "order_id",
      "sub_id",
      "service_dates",
      "invoice_date",
      "payment_target",
      "status",
      "description"
    )
    VALUES (1, 1, 1, 'A1', 'R1', '["2026-01-01"]', '2026-01-10', '2026-01-17', '-', 'Original invoice')
  `);
  await dataSource.query(`
    INSERT INTO "invoice_item" (
      "kind",
      "title",
      "description",
      "unit",
      "price",
      "amount",
      "invoice_id"
    )
    VALUES
      ('Artikel', 'Item 1', 'Description 1', 'm', 10, 2, 1),
      ('Hinweis', 'Heading', 'Description 2', NULL, NULL, NULL, 1)
  `);
  await dataSource.query(`
    INSERT INTO "invoice_document" (
      "id",
      "creation_date",
      "created_at",
      "updated_at",
      "client_id",
      "order_title",
      "order_id",
      "invoice_id",
      "service_dates",
      "invoice_date",
      "payment_target",
      "can_have_cash_discount"
    )
    VALUES
      ('INV-2026-01', '2026-01-10', 1, 1, 'K1', 'Order title', 'A1', 1, '["2026-01-01"]', '2026-01-10', '2026-01-17', 0),
      ('INV-2026-02', '2026-01-11', 2, 2, 'K1', 'Order title', 'A1', 1, '["2026-01-01"]', '2026-01-10', '2026-01-17', 0)
  `);
  await dataSource.query(`
    INSERT INTO "overdue_notice" (
      "id",
      "created_at",
      "updated_at",
      "order_id",
      "sub_id",
      "description",
      "notice_date",
      "payments_until",
      "payment_target",
      "notice_level",
      "payment_status",
      "notice_costs",
      "default_interest"
    )
    VALUES (1, 1, 1, 'A1', 'M1', 'Original notice', '2026-02-01', '2026-02-01', '2026-02-08', '1. Mahnung', '-', 5, 1.5)
  `);
  await dataSource.query(`
    INSERT INTO "overdue_notice_invoice_document_junction" (
      "overdue_notice_id",
      "invoice_document_id"
    )
    VALUES
      (1, 'INV-2026-01'),
      (1, 'INV-2026-02')
  `);
  await dataSource.query(`
    INSERT INTO "overdue_notice_document" (
      "id",
      "creation_date",
      "created_at",
      "updated_at",
      "client_id",
      "order_title",
      "order_id",
      "overdue_notice_id",
      "notice_level",
      "notice_date",
      "payments_until",
      "payment_target",
      "notice_costs",
      "default_interest"
    )
    VALUES
      ('MAHN-2026-01', '2026-02-01', 1, 1, 'K1', 'Order title', 'A1', 1, '1. Mahnung', '2026-02-01', '2026-02-01', '2026-02-08', 5, 1.5),
      ('MAHN-2026-02', '2026-02-02', 2, 2, 'K1', 'Order title', 'A1', 1, '1. Mahnung', '2026-02-01', '2026-02-01', '2026-02-08', 5, 1.5)
  `);
}
