import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreditNote1742036000000 implements MigrationInterface {
  name = "AddCreditNote1742036000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
    await queryRunner.startTransaction();

    await queryRunner.query(`
      CREATE TABLE "credit_note" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "credit_date" text NOT NULL,
        "status" text NOT NULL,
        "description" text,
        "referenced_invoice_document_ids" text,
        CONSTRAINT "FK_credit_note_order_id" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER credit_note_update_updated_at
      AFTER UPDATE ON credit_note FOR EACH ROW
      BEGIN
        UPDATE credit_note SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "credit_note_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "credit_note_id" integer NOT NULL,
        CONSTRAINT "FK_credit_note_item_credit_note_id" FOREIGN KEY ("credit_note_id") REFERENCES "credit_note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TABLE "credit_note_document" (
        "id" text PRIMARY KEY NOT NULL,
        "creation_date" text NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "client_id" text NOT NULL,
        "client_email" text,
        "client_company_name" text,
        "client_first_name" text,
        "client_last_name" text,
        "client_street_and_number" text,
        "client_postal_code" text,
        "client_city" text,
        "order_title" text NOT NULL,
        "credit_note_id" integer NOT NULL,
        "credit_date" text NOT NULL,
        CONSTRAINT "FK_credit_note_document_credit_note_id" FOREIGN KEY ("credit_note_id") REFERENCES "credit_note" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER credit_note_document_update_updated_at
      AFTER UPDATE ON credit_note_document FOR EACH ROW
      BEGIN
        UPDATE credit_note_document SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "credit_note_document_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "credit_note_document_id" text NOT NULL,
        CONSTRAINT "FK_credit_note_document_item_credit_note_document_id" FOREIGN KEY ("credit_note_document_id") REFERENCES "credit_note_document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      ) STRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    await queryRunner.startTransaction();

    await queryRunner.query(`DROP TABLE IF EXISTS "credit_note_document_item"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS "credit_note_document_update_updated_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_note_document"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_note_item"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS "credit_note_update_updated_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_note"`);
  }
}
