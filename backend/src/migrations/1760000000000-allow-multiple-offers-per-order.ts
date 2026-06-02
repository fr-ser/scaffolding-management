import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowMultipleOffersPerOrder1760000000000 implements MigrationInterface {
  name = "AllowMultipleOffersPerOrder1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite PRAGMA foreign_keys cannot be changed inside a transaction.
    await queryRunner.commitTransaction();
    // The offer table is referenced by offer_item and offer_document.
    // Disable FK checks while rebuilding the table, then re-enable them below.
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    await queryRunner.startTransaction();

    // SQLite cannot drop the UNIQUE(order_id) constraint in place, so rebuild the table.
    await queryRunner.query(`DROP TRIGGER IF EXISTS offer_update_updated_at`);
    await queryRunner.query(`
      CREATE TABLE "offer_new" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "updated_at" real NOT NULL DEFAULT (unixepoch('subsec')),
        "order_id" text NOT NULL,
        "status" text NOT NULL,
        "description" text,
        "offered_at" text NOT NULL,
        "offer_valid_until" text NOT NULL,
        CONSTRAINT "FK_order_id" FOREIGN KEY ("order_id") REFERENCES "order" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      ) STRICT
    `);
    await queryRunner.query(`
      INSERT INTO "offer_new" (
        "id",
        "created_at",
        "updated_at",
        "order_id",
        "status",
        "description",
        "offered_at",
        "offer_valid_until"
      )
      SELECT
        "id",
        "created_at",
        "updated_at",
        "order_id",
        "status",
        "description",
        "offered_at",
        "offer_valid_until"
      FROM "offer"
    `);
    await queryRunner.query(`DROP TABLE "offer"`);
    await queryRunner.query(`ALTER TABLE "offer_new" RENAME TO "offer"`);
    await queryRunner.query(`
      CREATE TRIGGER offer_update_updated_at
      AFTER UPDATE ON offer FOR EACH ROW
      BEGIN
        UPDATE offer SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
    await queryRunner.startTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SQLite PRAGMA foreign_keys cannot be changed inside a transaction.
    await queryRunner.commitTransaction();
    // The offer table is referenced by offer_item and offer_document.
    // Disable FK checks while rebuilding the table, then re-enable them below.
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    await queryRunner.startTransaction();

    // SQLite cannot add the UNIQUE(order_id) constraint in place, so rebuild the table.
    await queryRunner.query(`DROP TRIGGER IF EXISTS offer_update_updated_at`);
    await queryRunner.query(`
      CREATE TABLE "offer_new" (
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
      INSERT INTO "offer_new" (
        "id",
        "created_at",
        "updated_at",
        "order_id",
        "status",
        "description",
        "offered_at",
        "offer_valid_until"
      )
      SELECT
        "id",
        "created_at",
        "updated_at",
        "order_id",
        "status",
        "description",
        "offered_at",
        "offer_valid_until"
      FROM "offer"
      WHERE "id" IN (SELECT MIN("id") FROM "offer" GROUP BY "order_id")
    `);
    await queryRunner.query(`DROP TABLE "offer"`);
    await queryRunner.query(`ALTER TABLE "offer_new" RENAME TO "offer"`);
    await queryRunner.query(`
      CREATE TRIGGER offer_update_updated_at
      AFTER UPDATE ON offer FOR EACH ROW
      BEGIN
        UPDATE offer SET updated_at = unixepoch('subsec')
        WHERE rowid = OLD.rowid;
      END;
    `);
    await queryRunner.commitTransaction();
    await queryRunner.query(`PRAGMA foreign_keys = ON`);
    await queryRunner.startTransaction();
  }
}
