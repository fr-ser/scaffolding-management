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
        "price" numeric
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "offer_document_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" numeric,
        "amount" numeric,
        "offer_document_id" text NOT NULL,
        CONSTRAINT "FK_a7b490d98b70a86f764a949f999" FOREIGN KEY ("offer_document_id") REFERENCES "offer_document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "invoice_document_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" numeric,
        "amount" numeric,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_80e2a45e785dd7506d0a9037a27" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "overdue_notice" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "sub_id" text NOT NULL,
        "description" text,
        "notice_date" text NOT NULL,
        "payments_until" text NOT NULL,
        "payment_target" text NOT NULL,
        "notice_level" text NOT NULL,
        "payment_status" text NOT NULL,
        "notice_costs" numeric NOT NULL,
        "default_interest" numeric,
        CONSTRAINT "FK_75531ab02ca06794a60271527d1" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
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
        "offered_at" text NOT NULL,
        "offer_valid_until" text NOT NULL,
        CONSTRAINT "FK_296a2bb8e15dc276478de2a6709" FOREIGN KEY ("offer_id") REFERENCES "offer" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
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
        "invoice_id" integer NOT NULL,
        "service_dates" text NOT NULL,
        "payment_target" text NOT NULL,
        "can_have_cash_discount" boolean NOT NULL,
        "discount_duration" numeric,
        "discount_percentage" numeric,
        CONSTRAINT "FK_431abc189f1ef6c8ee0dff3d4bd" FOREIGN KEY ("invoice_id") REFERENCES "invoice" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
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
        "overdue_notice_id" integer NOT NULL,
        "notice_level" text NOT NULL,
        "notice_date" text NOT NULL,
        "payments_until" text NOT NULL,
        "payment_target" text NOT NULL,
        "notice_costs" numeric NOT NULL,
        "default_interest" numeric,
        CONSTRAINT "FK_3e474d349cd3307a0e3c4aad3cf" FOREIGN KEY ("overdue_notice_id") REFERENCES "overdue_notice" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "offer_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" numeric,
        "amount" numeric,
        "offer_id" integer NOT NULL,
        CONSTRAINT "FK_c2ba09983ba4b4ca5b57360fc11" FOREIGN KEY ("offer_id") REFERENCES "offer" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
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
        CONSTRAINT "REL_de27658a4ecb056097fb5c3f0a" UNIQUE ("order_id"),
        CONSTRAINT "FK_de27658a4ecb056097fb5c3f0ab" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice_item" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "kind" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "unit" text,
        "price" numeric,
        "amount" numeric,
        "invoice_id" integer NOT NULL,
        CONSTRAINT "FK_9830c1881dd701d440c2164c3cd" FOREIGN KEY ("invoice_id") REFERENCES "invoice" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "invoice" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "sub_id" text NOT NULL,
        "service_dates" text NOT NULL,
        "invoice_date" text NOT NULL,
        "payment_target" text NOT NULL,
        "status" text NOT NULL,
        "description" text,
        CONSTRAINT "FK_1e74a9888e5e228184769ba3dfd" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
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
      )
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
        "can_have_cash_discount" boolean NOT NULL,
        "discount_duration" numeric,
        "discount_percentage" numeric,
        CONSTRAINT "FK_a0d9cbb7f4a017bac3198dd8ca0" FOREIGN KEY ("client_id") REFERENCES "client" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "overdue_notice_invoice_document_junction" (
        "overdue_notice_id" integer NOT NULL,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_d59594eb76f18bfefe606c96af1" FOREIGN KEY ("overdue_notice_id") REFERENCES "overdue_notice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_e771d43f961f230dd6245bfd0b0" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE RESTRICT,
        PRIMARY KEY ("overdue_notice_id", "invoice_document_id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_d59594eb76f18bfefe606c96af" ON "overdue_notice_invoice_document_junction" ("overdue_notice_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e771d43f961f230dd6245bfd0b" ON "overdue_notice_invoice_document_junction" ("invoice_document_id") `,
    );
    await queryRunner.query(`
      CREATE TABLE "overdue_notice_document_invoice_document_junction" (
        "overdue_notice_document_id" text NOT NULL,
        "invoice_document_id" text NOT NULL,
        CONSTRAINT "FK_e5b1bbf1f45dc069d47e6d590bf" FOREIGN KEY ("overdue_notice_document_id") REFERENCES "overdue_notice_document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_c529c22acf50be8e097c519b802" FOREIGN KEY ("invoice_document_id") REFERENCES "invoice_document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        PRIMARY KEY ("overdue_notice_document_id", "invoice_document_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_e5b1bbf1f45dc069d47e6d590b" ON "overdue_notice_document_invoice_document_junction" ("overdue_notice_document_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c529c22acf50be8e097c519b80" ON "overdue_notice_document_invoice_document_junction" ("invoice_document_id") `,
    );
  }

  public async down(): Promise<void> {
    throw new Error("No down migration implemented");
  }
}
