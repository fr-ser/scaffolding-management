import { MigrationInterface, QueryRunner } from "typeorm";

type DuplicateGroup = {
  source_id: number;
};

type DuplicateDocument = {
  id: string;
};

type InsertIdResult = {
  id: number;
};

export class EnforceSingleDocumentPerInvoiceNotice1780420000000 implements MigrationInterface {
  name = "EnforceSingleDocumentPerInvoiceNotice1780420000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.splitDuplicateInvoiceDocuments(queryRunner);
    await this.splitDuplicateOverdueNoticeDocuments(queryRunner);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_invoice_document_invoice_id_unique"
      ON "invoice_document" ("invoice_id")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_overdue_notice_document_overdue_notice_id_unique"
      ON "overdue_notice_document" ("overdue_notice_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_overdue_notice_document_overdue_notice_id_unique"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_document_invoice_id_unique"`);
  }

  private async splitDuplicateInvoiceDocuments(queryRunner: QueryRunner): Promise<void> {
    const duplicateGroups = (await queryRunner.query(`
      SELECT "invoice_id" AS "source_id"
      FROM "invoice_document"
      GROUP BY "invoice_id"
      HAVING COUNT(*) > 1
    `)) as DuplicateGroup[];

    for (const group of duplicateGroups) {
      const duplicateDocuments = (await queryRunner.query(
        `
          SELECT "id"
          FROM "invoice_document"
          WHERE "invoice_id" = ?
          ORDER BY "created_at" ASC, "id" ASC
        `,
        [group.source_id],
      )) as DuplicateDocument[];

      for (const document of duplicateDocuments.slice(1)) {
        const note =
          `Automatisch angelegt: Dieses Duplikat wurde erstellt, ` +
          `weil das Dokument ${document.id} ursprünglich mit der bereits dokumentierten Rechnung ` +
          `${group.source_id} verknüpft war.`;

        await queryRunner.query(
          `
            INSERT INTO "invoice" (
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
            SELECT
              "created_at",
              unixepoch('subsec'),
              "order_id",
              "sub_id",
              "service_dates",
              "invoice_date",
              "payment_target",
              "status",
              ?
            FROM "invoice"
            WHERE "id" = ?
          `,
          [note, group.source_id],
        );

        const [{ id: newInvoiceId }] = (await queryRunner.query(
          `SELECT last_insert_rowid() AS "id"`,
        )) as InsertIdResult[];

        await queryRunner.query(
          `
            INSERT INTO "invoice_item" (
              "kind",
              "title",
              "description",
              "unit",
              "price",
              "amount",
              "invoice_id"
            )
            SELECT
              "kind",
              "title",
              "description",
              "unit",
              "price",
              "amount",
              ?
            FROM "invoice_item"
            WHERE "invoice_id" = ?
          `,
          [newInvoiceId, group.source_id],
        );

        await queryRunner.query(
          `
            UPDATE "invoice_document"
            SET "invoice_id" = ?
            WHERE "id" = ?
          `,
          [newInvoiceId, document.id],
        );
      }
    }
  }

  private async splitDuplicateOverdueNoticeDocuments(queryRunner: QueryRunner): Promise<void> {
    const duplicateGroups = (await queryRunner.query(`
      SELECT "overdue_notice_id" AS "source_id"
      FROM "overdue_notice_document"
      GROUP BY "overdue_notice_id"
      HAVING COUNT(*) > 1
    `)) as DuplicateGroup[];

    for (const group of duplicateGroups) {
      const duplicateDocuments = (await queryRunner.query(
        `
          SELECT "id"
          FROM "overdue_notice_document"
          WHERE "overdue_notice_id" = ?
          ORDER BY "created_at" ASC, "id" ASC
        `,
        [group.source_id],
      )) as DuplicateDocument[];

      for (const document of duplicateDocuments.slice(1)) {
        const note =
          `Automatisch angelegt: Dieses Duplikat wurde erstellt, ` +
          `weil das Dokument ${document.id} ursprünglich mit der bereits dokumentierten Mahnung ` +
          `${group.source_id} verknüpft war.`;

        await queryRunner.query(
          `
            INSERT INTO "overdue_notice" (
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
            SELECT
              "created_at",
              unixepoch('subsec'),
              "order_id",
              "sub_id",
              ?,
              "notice_date",
              "payments_until",
              "payment_target",
              "notice_level",
              "payment_status",
              "notice_costs",
              "default_interest"
            FROM "overdue_notice"
            WHERE "id" = ?
          `,
          [note, group.source_id],
        );

        const [{ id: newOverdueNoticeId }] = (await queryRunner.query(
          `SELECT last_insert_rowid() AS "id"`,
        )) as InsertIdResult[];

        await queryRunner.query(
          `
            INSERT INTO "overdue_notice_invoice_document_junction" (
              "overdue_notice_id",
              "invoice_document_id"
            )
            SELECT
              ?,
              "invoice_document_id"
            FROM "overdue_notice_invoice_document_junction"
            WHERE "overdue_notice_id" = ?
          `,
          [newOverdueNoticeId, group.source_id],
        );

        await queryRunner.query(
          `
            UPDATE "overdue_notice_document"
            SET "overdue_notice_id" = ?
            WHERE "id" = ?
          `,
          [newOverdueNoticeId, document.id],
        );
      }
    }
  }
}
