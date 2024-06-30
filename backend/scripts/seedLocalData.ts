// CONFIG_PATH=local.env npx ts-node -r tsconfig-paths/register scripts/seedLocalData.ts
import fs from "fs";
import { DataSource } from "typeorm";

import { DB_PATH } from "@/config";
import { getAppDataSource } from "@/db";
import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { OfferDocumentItem } from "@/db/entities/document_items";
import { OfferDocument } from "@/db/entities/documents";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { OfferItem } from "@/db/entities/order_items";
import { ArticleKind, ClientSalutation, OfferStatus, OrderStatus } from "@/global/types/appTypes";

async function insertData(dataSource: DataSource) {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Client)
    .values(
      Array.from(Array(10)).map((_: unknown, index: number) => {
        return {
          id: `K${index + 1}`,
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
        return {
          id: `A${index + 1}`,
          status: OrderStatus.preparation,
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
        return {
          order_id: `A${index + 1}`,
          status: OfferStatus.created,
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
          id: `A-2020-01-${index + 1}`,
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
          title: `Document Title ${index + 1}`,
          creation_date: `2021-01-0${index + 1}`,
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
}

async function main() {
  if (fs.existsSync(DB_PATH)) {
    console.log("database already exists");
    return;
  }

  const dataSource = await getAppDataSource();
  await dataSource.synchronize();

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
  });
