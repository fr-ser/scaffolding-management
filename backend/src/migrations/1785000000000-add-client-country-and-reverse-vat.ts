import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientCountryAndReverseVat1785000000000 implements MigrationInterface {
  name = "AddClientCountryAndReverseVat1785000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
    await queryRunner.startTransaction();

    await queryRunner.query(`
      ALTER TABLE "client" ADD COLUMN "country" text NOT NULL DEFAULT 'DE'
    `);
    await queryRunner.query(`
      ALTER TABLE "client" ADD COLUMN "reverse_vat" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "client" ADD COLUMN "vat_id" text
    `);

    const documentTables = [
      "invoice_document",
      "offer_document",
      "credit_note_document",
      "overdue_notice_document",
    ];

    for (const table of documentTables) {
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD COLUMN "client_country" text NOT NULL DEFAULT 'DE'
      `);
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD COLUMN "client_reverse_vat" integer NOT NULL DEFAULT 0
      `);
      await queryRunner.query(`
        ALTER TABLE "${table}" ADD COLUMN "client_vat_id" text
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    await queryRunner.startTransaction();

    const documentTables = [
      "overdue_notice_document",
      "credit_note_document",
      "offer_document",
      "invoice_document",
    ];

    for (const table of documentTables) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "client_vat_id"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "client_reverse_vat"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "client_country"`);
    }

    await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "vat_id"`);
    await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "reverse_vat"`);
    await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "country"`);
  }
}
