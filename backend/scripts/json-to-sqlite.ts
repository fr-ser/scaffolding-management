//  npm run run-script -- scripts/json-to-sqlite.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";

import { getAppDataSource, initializeAppDataSource } from "@/db";
import { Article } from "@/db/entities/article";
import { Client } from "@/db/entities/client";
import { InvoiceDocumentItem, OfferDocumentItem } from "@/db/entities/document_items";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { InvoiceItem, OfferItem } from "@/db/entities/order_items";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { ArticleKind } from "@/global/types/appTypes";
import { log } from "@/helpers/logging";

const SOURCE_JSON = "./backup.json";
const TARGET_DB = "./new.db";

async function insertData(data: any) {
  const dataSource = getAppDataSource();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Client)
    .values(
      Object.values(data.kunde).map((kunde: any) => {
        return {
          id: kunde.kundenNr,
          first_name: kunde.vorname,
          last_name: kunde.nachname,
          salutation: kunde.anrede || null,
          email: kunde.email || null,
          landline_phone: kunde.festnetz || null,
          company_name: kunde.firma || null,
          birthday: kunde.geburtstag || null,
          comment: kunde.kommentar || null,
          mobile_phone: kunde.mobil || null,
          postal_code: kunde.plz || null,
          city: kunde.stadt || null,
          street_and_number: kunde.strasse || null,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Article)
    .values(
      Object.values(data.artikel).map((artikel: any) => {
        return {
          id: artikel.artikelNr,
          kind: artikel.art == "heading" ? ArticleKind.heading : ArticleKind.item,
          title: artikel.titel,
          description: artikel.bezeichnung,
          price: artikel.preis || null,
          unit: artikel.einheit || null,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Order)
    .values(
      Object.values(data.auftrag).map((auftrag: any) => {
        return {
          id: auftrag.auftragsNr,
          status: auftrag.status,
          title: auftrag.titel,
          client_id: auftrag.kunde,
          description: auftrag.beschreibung || null,
          can_have_cash_discount: auftrag.skontoberechtigt,
          discount_duration: auftrag.skontodauer || null,
          discount_percentage: auftrag.skontoprozent || null,
        };
      }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Offer)
    .values(
      Object.values(data.auftrag)
        .filter((auftrag: any) => !!auftrag.angebot)
        .map((auftrag: any) => {
          return {
            order_id: auftrag.auftragsNr,
            status: auftrag.angebot.angebotsstatus,
            description: auftrag.angebot.beschreibung || null,
            offered_at: auftrag.angebot.angebotsdatum,
            offer_valid_until: auftrag.angebot.angebotBis,
          };
        }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferItem)
    .values(
      Object.values(data.auftrag)
        .filter((auftrag: any) => !!auftrag.angebot)
        .flatMap((auftrag: any) =>
          auftrag.angebot.positionen.map((position: any) => {
            return {
              offer_id: () => `(SELECT id from offer where order_id='${auftrag.auftragsNr}')`,
              kind: position.art == "heading" ? ArticleKind.heading : ArticleKind.item,
              title: position.artikeltitel,
              description: position.bezeichnung,
              unit: position.einheit,
              price: position.preis,
              amount: position.anzahl,
            };
          }),
        ),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Invoice)
    .values(
      Object.values(data.auftrag)
        .filter(
          (auftrag: any) => !!auftrag.rechnungen && Object.keys(auftrag.rechnungen).length > 0,
        )
        .flatMap((auftrag: any) =>
          Object.values(auftrag.rechnungen).map((rechnung: any) => {
            return {
              order_id: auftrag.auftragsNr,
              sub_id: rechnung.subID,
              service_dates: rechnung.leistungsdatum,
              invoice_date: rechnung.rechnungsdatum,
              payment_target: rechnung.zahlungsziel,
              status: rechnung.zahlungsstatus,
              description: rechnung.beschreibung,
            };
          }),
        ),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(InvoiceItem)
    .values(
      Object.values(data.auftrag)
        .filter(
          (auftrag: any) => !!auftrag.rechnungen && Object.keys(auftrag.rechnungen).length > 0,
        )
        .flatMap((auftrag: any) =>
          Object.values(auftrag.rechnungen).flatMap((rechnung: any) =>
            rechnung.positionen.map((position: any) => {
              return {
                invoice_id: () => `(
                      SELECT id from invoice
                      where order_id='${auftrag.auftragsNr}' and sub_id='${rechnung.subID}'
                  )`,
                kind: position.art == "heading" ? ArticleKind.heading : ArticleKind.item,
                title: position.artikeltitel,
                description: position.bezeichnung,
                unit: position.einheit,
                price: position.preis,
                amount: position.anzahl,
              };
            }),
          ),
        ),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OverdueNotice)
    .values(
      Object.values(data.auftrag)
        .filter((auftrag: any) => !!auftrag.mahnungen && Object.keys(auftrag.mahnungen).length > 0)
        .flatMap((auftrag: any) =>
          Object.values(auftrag.mahnungen).map((mahnung: any) => {
            return {
              order_id: auftrag.auftragsNr,
              sub_id: mahnung.subID,
              description: mahnung.beschreibung || undefined,
              notice_date: mahnung.mahndatum,
              payments_until: mahnung.zahlungenBis,
              payment_target: mahnung.zahlungsziel,
              notice_level: mahnung.mahnstufe,
              payment_status: mahnung.zahlungsstatus,
              notice_costs: mahnung.mahnkosten,
              default_interest: mahnung.verzugszinsen,
            };
          }),
        ),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(InvoiceDocument)
    .values(
      Object.values(data.dokument)
        .filter((dokument: any) => dokument.art === "Rechnung")
        .map((dokument: any) => {
          return {
            id: dokument.dokumentenNr,
            creation_date: dokument.speicherdatum,
            order_id: dokument.auftrag.auftragsNr,
            client_id: dokument.kunde.kundenNr,
            client_email: dokument.kunde.email,
            client_company_name: dokument.kunde.firma,
            client_first_name: dokument.kunde.vorname,
            client_last_name: dokument.kunde.nachname,
            client_street_and_number: dokument.kunde.strasse,
            client_postal_code: dokument.kunde.plz,
            client_city: dokument.kunde.strasse,
            order_title: dokument.auftrag.titel,
            invoice_id: () => `(
                  SELECT id from invoice
                  where order_id='${dokument.auftrag.auftragsNr}' and sub_id='${dokument.rechnung.subID}'
              )`,
            service_dates: dokument.rechnung.leistungsdatum,
            invoice_date: dokument.rechnung.rechnungsdatum,
            payment_target: dokument.rechnung.zahlungsziel,
            can_have_cash_discount: dokument.auftrag.skontoberechtigt,
            discount_duration: dokument.auftrag.skontodauer,
            discount_percentage: dokument.auftrag.skontoprozent,
          };
        }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(InvoiceDocumentItem)
    .values(
      Object.values(data.dokument)
        .filter((dokument: any) => dokument.art === "Rechnung")
        .flatMap((dokument: any) => {
          return dokument.rechnung.positionen.map((position: any) => {
            return {
              invoice_document_id: () =>
                `(SELECT id from invoice_document where id = '${dokument.dokumentenNr}')`,
              kind: position.art == "heading" ? ArticleKind.heading : ArticleKind.item,
              title: position.artikeltitel,
              description: position.bezeichnung,
              unit: position.einheit,
              price: position.preis,
              amount: position.anzahl,
            };
          });
        }),
    )
    .execute();

  const overdueNoticeRepository = dataSource.getRepository(OverdueNotice);

  await Promise.all(
    Object.values(data.auftrag)
      .filter((auftrag: any) => !!auftrag.mahnungen && Object.keys(auftrag.mahnungen).length > 0)
      .flatMap((auftrag: any) =>
        Object.values(auftrag.mahnungen).flatMap((mahnung: any) => {
          return overdueNoticeRepository
            .findOneByOrFail({ order_id: auftrag.auftragsNr, sub_id: mahnung.subID })
            .then((overdueNotice) => {
              return dataSource
                .createQueryBuilder()
                .relation(OverdueNotice, "invoice_documents")
                .of(overdueNotice)
                .add(mahnung.positionen);
            });
        }),
      ),
  );

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferDocument)
    .values(
      Object.values(data.dokument)
        .filter((dokument: any) => dokument.art == "Angebot")
        .map((dokument: any) => {
          return {
            id: dokument.dokumentenNr,
            creation_date: dokument.speicherdatum,
            order_id: dokument.auftrag.auftragsNr,
            client_id: dokument.kunde.kundenNr,
            client_email: dokument.kunde.email,
            client_company_name: dokument.kunde.firma,
            client_first_name: dokument.kunde.vorname,
            client_last_name: dokument.kunde.nachname,
            client_street_and_number: dokument.kunde.strasse,
            client_postal_code: dokument.kunde.plz,
            client_city: dokument.kunde.stadt,
            order_title: dokument.auftrag.titel,
            offer_id: () =>
              `(SELECT id from offer where order_id='${dokument.auftrag.auftragsNr}')`,
            offered_at: dokument.angebot.angebotsdatum,
            offer_valid_until: dokument.angebot.angebotBis,
          };
        }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OfferDocumentItem)
    .values(
      Object.values(data.dokument)
        .filter((dokument: any) => dokument.art === "Angebot")
        .flatMap((dokument: any) => {
          return dokument.angebot.positionen.map((position: any) => {
            return {
              offer_document_id: () =>
                `(SELECT id from offer_document where id='${dokument.dokumentenNr}')`,
              kind: position.art == "heading" ? ArticleKind.heading : ArticleKind.item,
              title: position.artikeltitel,
              description: position.bezeichnung,
              unit: position.einheit,
              price: position.preis,
              amount: position.anzahl,
            };
          });
        }),
    )
    .execute();

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(OverdueNoticeDocument)
    .values(
      Object.values(data.dokument)
        .filter((dokument: any) => dokument.art === "Mahnung")
        .map((dokument: any) => {
          return {
            id: dokument.dokumentenNr,
            creation_date: dokument.speicherdatum,
            order_id: dokument.auftrag.auftragsNr,
            client_email: dokument.kunde.email,
            client_id: dokument.kunde.kundenNr,
            client_company_name: dokument.kunde.firma,
            client_first_name: dokument.kunde.vorname,
            client_last_name: dokument.kunde.nachname,
            client_street_and_number: dokument.kunde.strasse,
            client_postal_code: dokument.kunde.plz,
            client_city: dokument.kunde.strasse,
            order_title: dokument.auftrag.titel,
            overdue_notice_id: () => `(
                  SELECT id from overdue_notice
                  where order_id='${dokument.auftrag.auftragsNr}' and sub_id='${dokument.mahnung.subID}'
              )`,
            title: dokument.titel,
            notice_level: dokument.mahnung.mahnstufe,
            notice_date: dokument.mahnung.mahndatum,
            payment_target: dokument.mahnung.zahlungsziel,
            payments_until: dokument.mahnung.zahlungenBis,
            notice_costs: dokument.mahnung.mahnkosten,
            default_interest: dokument.mahnung.verzugszinsen,
          };
        }),
    )
    .execute();

  const overdueNoticeDocumentRepository = dataSource.getRepository(OverdueNoticeDocument);

  await Promise.all(
    Object.values(data.dokument)
      .filter((dokument: any) => dokument.art == "Mahnung")
      .flatMap((dokument: any) => {
        return overdueNoticeDocumentRepository
          .findOneByOrFail({ id: dokument.dokumentenNr })
          .then((overdueNoticeDocument) => {
            return dataSource
              .createQueryBuilder()
              .relation(OverdueNoticeDocument, "invoice_documents")
              .of(overdueNoticeDocument)
              .add([
                ...new Set(
                  dokument.mahnung.positionen.map((position: any) => position.dokumentenNr),
                ),
              ]);
          });
      }),
  );
}

async function main() {
  log("Starting");
  const data = JSON.parse(fs.readFileSync(SOURCE_JSON, "utf-8"));
  log("loaded data");

  try {
    fs.unlinkSync(TARGET_DB);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await initializeAppDataSource(TARGET_DB);
  const dataSource = getAppDataSource();
  await dataSource.runMigrations({ transaction: "all" });
  log("initalized SQLite datasource");

  await insertData(data);
  log("inserted data");
}

main()
  .then(() => {
    log("Done");
  })
  .catch((err) => {
    log("Error: ", err);
  });
