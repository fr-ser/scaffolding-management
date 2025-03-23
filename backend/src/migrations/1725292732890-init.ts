import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1725292732890 implements MigrationInterface {
  name = "Init1725292732890";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
    await queryRunner.startTransaction();

    await queryRunner.query(`
      CREATE TABLE "article" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER article_update_updated_at
      AFTER UPDATE ON article FOR EACH ROW
      BEGIN
        UPDATE article SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "offer_document_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "offer_document_id" text NOT NULL,
        CONSTRAINT "FK_offer_document_id" FOREIGN KEY ("offer_document_id") REFERENCES "offer_document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      ) STRICT
    `);
    await queryRunner.query(`
      CREATE TABLE "invoice_document_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_invoice_document_id" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "overdue_notice" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "sub_id" text,
        "description" text,
        "notice_date" text NOT NULL,
        "payments_until" text NOT NULL,
        "payment_target" text NOT NULL,
        "notice_level" text NOT NULL,
        "payment_status" text NOT NULL,
        "notice_costs" real NOT NULL,
        "default_interest" real,
        CONSTRAINT "FK_order_id" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER overdue_notice_update_updated_at
      AFTER UPDATE ON overdue_notice FOR EACH ROW
      BEGIN
        UPDATE overdue_notice SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "offer_document" (
        "id" text PRIMARY KEY NOT NULL,
        "creation_date" text NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "client_id" text NOT NULL,
        "client_email" text,
        "client_company_name" text,
        "client_first_name" text,
        "client_last_name" text,
        "client_street_and_number" text,
        "client_postal_code" text,
        "client_city" text,
        "order_title" text NOT NULL,
        "offer_id" integer NOT NULL,
        "order_id" text NOT NULL,
        "offered_at" text NOT NULL,
        "offer_valid_until" text NOT NULL,
        CONSTRAINT "FK_offer_id" FOREIGN KEY ("offer_id") REFERENCES "offer" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER offer_document_update_updated_at
      AFTER UPDATE ON offer_document FOR EACH ROW
      BEGIN
        UPDATE offer_document SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice_document" (
        "id" text PRIMARY KEY NOT NULL,
        "creation_date" text NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "client_id" text NOT NULL,
        "client_email" text,
        "client_company_name" text,
        "client_first_name" text,
        "client_last_name" text,
        "client_street_and_number" text,
        "client_postal_code" text,
        "client_city" text,
        "order_title" text NOT NULL,
        "order_id" text NOT NULL,
        "invoice_id" integer NOT NULL,
        "service_dates" text NOT NULL,
        "invoice_date" text NOT NULL,
        "payment_target" text NOT NULL,
        "can_have_cash_discount" int NOT NULL,
        "discount_duration" real,
        "discount_percentage" real,
        CONSTRAINT "FK_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoice" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER invoice_document_update_updated_at
      AFTER UPDATE ON invoice_document FOR EACH ROW
      BEGIN
        UPDATE invoice_document SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "overdue_notice_document" (
        "id" text PRIMARY KEY NOT NULL,
        "creation_date" text NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "client_id" text NOT NULL,
        "client_email" text,
        "client_company_name" text,
        "client_first_name" text,
        "client_last_name" text,
        "client_street_and_number" text,
        "client_postal_code" text,
        "client_city" text,
        "order_title" text NOT NULL,
        "order_id" text NOT NULL,
        "overdue_notice_id" integer NOT NULL,
        "notice_level" text NOT NULL,
        "notice_date" text NOT NULL,
        "payments_until" text NOT NULL,
        "payment_target" text NOT NULL,
        "notice_costs" real NOT NULL,
        "default_interest" real,
        CONSTRAINT "FK_overdue_notice_id" FOREIGN KEY ("overdue_notice_id") REFERENCES "overdue_notice" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER overdue_notice_document_update_updated_at
      AFTER UPDATE ON overdue_notice_document FOR EACH ROW
      BEGIN
        UPDATE overdue_notice_document SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "offer_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "offer_id" integer NOT NULL,
        CONSTRAINT "FK_offer_id" FOREIGN KEY ("offer_id") REFERENCES "offer" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TABLE "offer" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "status" text NOT NULL,
        "description" text,
        "offered_at" text NOT NULL,
        "offer_valid_until" text NOT NULL,
        CONSTRAINT "REL_unique_order_id" UNIQUE ("order_id"),
        CONSTRAINT "FK_order_id" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER offer_update_updated_at
      AFTER UPDATE ON offer FOR EACH ROW
      BEGIN
        UPDATE offer SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" REAL,
        "amount" REAL,
        "invoice_id" integer NOT NULL,
        CONSTRAINT "FK_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "invoice" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "sub_id" text,
        "service_dates" text NOT NULL,
        "invoice_date" text NOT NULL,
        "payment_target" text NOT NULL,
        "status" text NOT NULL,
        "description" text,
        CONSTRAINT "FK_order_id" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER invoice_update_updated_at
      AFTER UPDATE ON invoice FOR EACH ROW
      BEGIN
        UPDATE invoice SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "client" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "salutation" text,
        "email" text,
        "landline_phone" text,
        "company_name" text,
        "birthday" text,
        "comment" text,
        "mobile_phone" text,
        "first_name" text,
        "last_name" text,
        "postal_code" text,
        "city" text,
        "street_and_number" text
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER client_update_updated_at
      AFTER UPDATE ON client FOR EACH ROW
      BEGIN
        UPDATE client SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await queryRunner.query(`
      CREATE TABLE "order" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "client_id" text NOT NULL,
        "status" text NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "can_have_cash_discount" int NOT NULL,
        "discount_duration" real,
        "discount_percentage" real,
        CONSTRAINT "FK_client_id" FOREIGN KEY ("client_id") REFERENCES "client" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);

    await queryRunner.query(`
      CREATE TRIGGER order_update_updated_at
      AFTER UPDATE ON "order" FOR EACH ROW
      BEGIN
        UPDATE "order" SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);

    await await queryRunner.query(`
      CREATE TABLE "overdue_notice_invoice_document_junction" (
        "overdue_notice_id" integer NOT NULL,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_overdue_notice_id" FOREIGN KEY ("overdue_notice_id") REFERENCES "overdue_notice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_invoice_document_id" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE RESTRICT,
        PRIMARY KEY ("overdue_notice_id", "invoice_document_id")
      ) STRICT
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_onidj_overdue_notice_id" ON "overdue_notice_invoice_document_junction" ("overdue_notice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_onidj_invoice_document_id" ON "overdue_notice_invoice_document_junction" ("invoice_document_id") `,
    );
    await queryRunner.query(`
      CREATE TABLE "overdue_notice_document_invoice_document_junction" (
        "overdue_notice_document_id" text NOT NULL,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_overdue_notice_document_id" FOREIGN KEY ("overdue_notice_document_id") REFERENCES "overdue_notice_document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_invoice_document_id" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY ("overdue_notice_document_id", "invoice_document_id")
      ) STRICT
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ondidj_overdue_notice_document_id" ON "overdue_notice_document_invoice_document_junction" ("overdue_notice_document_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ondidj_invoice_document_id" ON "overdue_notice_document_invoice_document_junction" ("invoice_document_id") `,
    );
  }

  public async down(): Promise<void> {
    throw new Error("No down migration implemented");
  }
}
