import fs from "fs";
import { DataSource } from "typeorm";

import { DB_PATH } from "@/config";
import { initializeAppDataSource } from "@/db";
import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { InvoiceDocumentItem, OfferDocumentItem } from "@/db/entities/document_items";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { OfferItem } from "@/db/entities/order_items";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import {
  ArticleKind,
  ClientSalutation,
  OfferStatus,
  OrderStatus,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";

async function insertData(dataSource: DataSource) {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Client)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        return {
          id: `K${index + 1}`,
          created_at: (Date.now() + 100 * index) / 1000,
          first_name: `First Name ${index + 1}`,
          last_name: `Last Name ${index + 1}`,
          salutation: ClientSalutation.mister_doctor,
          email: `email${index + 1}@local.com`,
          landline_phone: `+49 1111 ${index + 1}`,
          company_name: `Company ${index + 1}`,
          birthday: `2021-01-0${index + 1}`,
          comment: `Comment ${index + 1}`,
          mobile_phone: `+49 222 ${index + 1}`,
          postal_code: `postal code ${index + 1}`,
          city: `city ${index + 1}`,
          street_and_number: `street and number ${index + 1}`,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Article)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const isEven = index % 2 === 0;
        return {
          id: `Art${index + 1}`,
          created_at: (Date.now() + 100 * index) / 1000,
          kind: isEven ? ArticleKind.item : ArticleKind.heading,
          title: `Title ${index + 1}`,
          description: `Description ${index + 1}`,
          price: isEven ? 101 + index : undefined,
          unit: isEven ? `Unit ${index + 1}` : undefined,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Order)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const anyOrderStatus =
          Object.values(OrderStatus)[index % Object.values(OrderStatus).length];

        return {
          id: `A${index + 1}`,
          created_at: (Date.now() + 100 * index) / 1000,
          status: anyOrderStatus,
          title: `Title ${index + 1}`,
          client_id: `K${index + 1}`,
          description: `Description ${index + 1}`,
          can_have_cash_discount: true,
          discount_duration: index + 1,
          discount_percentage: index + 1,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Offer)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const anyOfferStatus =
          Object.values(OfferStatus)[index % Object.values(OfferStatus).length];

        return {
          order_id: `A${index + 1}`,
          status: anyOfferStatus,
          description: `Description ${index + 1}`,
          offered_at: `2021-01-0${index + 1}`,
          offer_valid_until: `2022-01-0${index + 1}`,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferItem)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const isEven = index % 2 === 0;

        return {
          offer_id: () => `(SELECT id from offer where order_id='A${index + 1}')`,
          kind: isEven ? ArticleKind.item : ArticleKind.heading,
          title: `Title ${index + 1}`,
          description: `Description ${index + 1}`,
          unit: isEven ? `Unit ${index + 1}` : undefined,
          price: isEven ? 101 + index : undefined,
          amount: isEven ? index + 1 : undefined,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferDocument)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        return {
          created_at: (Date.now() + 100 * index) / 1000,
          id: `A-2020-01-${index + 1}`,
          creation_date: `2021-01-0${index + 1}`,
          client_id: `K${index + 1}`,
          client_email: `email${index}@test.com`,
          client_company_name: `Company ${index + 1}`,
          client_first_name: `First Name ${index + 1}`,
          client_last_name: `Last Name ${index + 1}`,
          client_street_and_number: `street and number ${index + 1}`,
          client_postal_code: `postal code ${index + 1}`,
          client_city: `city ${index + 1}`,
          order_title: `Order Title ${index + 1}`,
          offer_id: () => `(SELECT id from offer where order_id='A${index + 1}')`,
          offered_at: `2021-02-0${index + 1}`,
          offer_valid_until: `2021-03-0${index + 1}`,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferDocumentItem)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const isEven = index % 2 === 0;

        return {
          offer_document_id: () =>
            `(SELECT id from offer_document where id='A-2020-01-${index + 1}')`,
          kind: isEven ? ArticleKind.item : ArticleKind.heading,
          title: `Title ${index + 1}`,
          description: `Description ${index + 1}`,
          unit: isEven ? `Unit ${index + 1}` : undefined,
          price: isEven ? 101 + index : undefined,
          amount: isEven ? index + 1 : undefined,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Invoice)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const anyPaymentStatus =
          Object.values(PaymentStatus)[index % Object.values(PaymentStatus).length];

        return {
          order_id: `A${index + 1}`,
          sub_id: String(index),
          service_dates: [`2021-01-0${index + 1}`, `2022-01-0${index + 1}`],
          invoice_date: `2023-01-0${index + 1}`,
          payment_target: `2024-01-0${index + 1}`,
          status: anyPaymentStatus,
          description: `description ${index + 1}`,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(InvoiceDocument)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        return {
          created_at: (Date.now() + 100 * index) / 1000,
          id: `R-2020-01-${index + 1}`,
          creation_date: `2021-01-0${index + 1}`,
          client_id: `K${index + 1}`,
          client_email: `email${index}@test.com`,
          client_company_name: `Company ${index + 1}`,
          client_first_name: `First Name ${index + 1}`,
          client_last_name: `Last Name ${index + 1}`,
          client_street_and_number: `street and number ${index + 1}`,
          client_postal_code: `postal code ${index + 1}`,
          client_city: `city ${index + 1}`,
          order_title: `Order Title ${index + 1}`,
          invoice_id: () => `(SELECT id from invoice where order_id='A${index + 1}')`,
          service_dates: [`2021-01-0${index + 1}`, `2022-01-0${index + 1}`],
          payment_target: `2024-01-0${index + 1}`,
          invoice_date: `2022-01-0${index + 1}`,
          can_have_cash_discount: false,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(InvoiceDocumentItem)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        const isEven = index % 2 === 0;

        return {
          invoice_document_id: () =>
            `(SELECT id from invoice_document where id='R-2020-01-${index + 1}')`,
          kind: isEven ? ArticleKind.item : ArticleKind.heading,
          title: `Title ${index + 1}`,
          description: `Description ${index + 1}`,
          unit: isEven ? `Unit ${index + 1}` : undefined,
          price: isEven ? 101 + index : undefined,
          amount: isEven ? index + 1 : undefined,
        };
      }),
    )
    .execute();

  for (let index = 0; index < 10; index++) {
    const anyPaymentStatus = Object.values(OverdueNoticePaymentStatus)[
      index % Object.values(OverdueNoticePaymentStatus).length
    ];
    const anyNoticeLevel =
      Object.values(OverdueNoticeLevel)[index % Object.values(OverdueNoticeLevel).length];
    const overdueNotice = await dataSource.manager.save(OverdueNotice, {
      order_id: `A${index + 1}`,
      sub_id: String(index),
      payments_until: `2021-01-0${index + 1}`,
      notice_date: `2023-01-0${index + 1}`,
      payment_target: `2024-01-0${index + 1}`,
      notice_level: anyNoticeLevel,
      payment_status: anyPaymentStatus,
      notice_costs: index + 1,
      default_interest: index + 10,
      description: `description ${index + 1}`,
    });

    await dataSource
      .createQueryBuilder()
      .relation(OverdueNotice, "invoice_documents")
      .of(overdueNotice)
      .add(`R-2020-01-${index + 1}`);
  }

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OverdueNoticeDocument)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        return {
          created_at: (Date.now() + 100 * index) / 1000,
          id: `M-2020-01-${index + 1}`,
          creation_date: `2021-01-0${index + 1}`,
          client_id: `K${index + 1}`,
          client_email: `email${index}@test.com`,
          client_company_name: `Company ${index + 1}`,
          client_first_name: `First Name ${index + 1}`,
          client_last_name: `Last Name ${index + 1}`,
          client_street_and_number: `street and number ${index + 1}`,
          client_postal_code: `postal code ${index + 1}`,
          client_city: `city ${index + 1}`,
          order_title: `Order Title ${index + 1}`,
          overdue_notice_id: () => `(SELECT id from overdue_notice where order_id='A${index + 1}')`,
          notice_level: OverdueNoticeLevel.first,
          notice_date: `2023-01-0${index + 1}`,
          payments_until: `2024-01-0${index + 1}`,
          payment_target: `2025-01-0${index + 1}`,
          notice_costs: index + 1,
        };
      }),
    )
    .execute();

  for (let index = 0; index < 10; index++) {
    await dataSource
      .createQueryBuilder()
      .relation(OverdueNoticeDocument, "invoice_documents")
      .of(`M-2020-01-${index + 1}`)
      .add(`R-2020-01-${index + 1}`);
  }
}

async function main() {
  const backupPath = `${DB_PATH}.backup`;

  if (fs.existsSync(DB_PATH)) {
    if (process.argv.includes("--overwrite")) {
      if (fs.existsSync(backupPath)) {
        console.log("deleting existing database backup");
        fs.unlinkSync(backupPath);
      }
      console.log("Moving the previous database to: ", backupPath);
      fs.renameSync(DB_PATH, backupPath);
    } else {
      console.log("database already exists");
      return;
    }
  }

  const dataSource = await initializeAppDataSource(DB_PATH);

  await dataSource.runMigrations({ transaction: "all" });

  await insertData(dataSource);

  console.log("Created seed database");
}
main()
  .then(() => {
    console.log("Finished creating local database");
  })
  .catch((err) => {
    try {
      fs.unlinkSync(DB_PATH);
    } catch (unlinkError) {
      console.error("Cannot remove database: ", unlinkError);
      console.error("Error: ", err);
    }
    console.error("Error: ", err);
    throw err;
  });
