import { DataSource } from "typeorm";

import { Client as DbClient } from "@/db/entities/client";
import { InvoiceDocument as DbInvoiceDocument } from "@/db/entities/documents";
import { Invoice as DbInvoice } from "@/db/entities/invoice";
import { Offer as DbOffer } from "@/db/entities/offer";
import { Order as DbOrder } from "@/db/entities/order";
import { OverdueNotice as DbOverdueNotice } from "@/db/entities/overdue_notice";
import {
  ArticleKind,
  ClientSalutation,
  OfferStatus,
  OrderStatus,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";
import {
  Client,
  Invoice,
  InvoiceDocument,
  Offer,
  OfferDocument,
  Order,
  OverdueNotice,
  OverdueNoticeDocument,
} from "@/global/types/entities";

export async function getInvoiceDocument(
  override: Partial<InvoiceDocument> = {},
  saveInDb?: DataSource,
): Promise<InvoiceDocument> {
  let invoiceId: number;
  let invoice: Invoice | undefined;

  if (override.invoice_id) {
    invoiceId = override.invoice_id;
  } else {
    invoice = await getInvoice({}, saveInDb);
    invoiceId = invoice.id;
  }

  const invoiceDocument = {
    ...{
      id: "document_id",
      created_at: 1,
      updated_at: 1,
      creation_date: "1992-12-12",
      client_id: "client_id",
      client_email: "client@mail.com",
      client_company_name: "client_company_name",
      client_first_name: "client_first_name",
      client_last_name: "client_last_name",
      client_street_and_number: "client_street_and_number",
      client_postal_code: "client_postal_code",
      client_city: "client_city",
      order_title: "order_title",
      invoice_id: invoiceId,
      items: [
        {
          id: 1,
          invoice_document_id: "document_id",
          kind: ArticleKind.heading,
          title: "title1",
          description: "description1",
        },
        {
          id: 2,
          invoice_document_id: "document_id",
          kind: ArticleKind.item,
          title: "title2",
          description: "description2",
          unit: "unit",
          price: 10,
          amount: 100,
        },
      ],
      service_dates: ["1993-12-12", "1994-12-13"],
      payment_target: "1995-12-12",
      can_have_cash_discount: false,
      discount_duration: 0,
      discount_percentage: 0,
    },
    ...override,
  };

  if (saveInDb) {
    if (invoice) await saveInDb.getRepository(DbInvoice).save(invoice);

    await saveInDb.getRepository(DbInvoiceDocument).save(invoiceDocument);
  }

  return invoiceDocument;
}

export async function getOfferDocument(): Promise<OfferDocument> {
  return {
    id: "document_id",
    created_at: 1,
    updated_at: 1,
    creation_date: "1992-12-12",
    client_id: "client_id",
    client_email: "client@mail.com",
    client_company_name: "client_company_name",
    client_first_name: "client_first_name",
    client_last_name: "client_last_name",
    client_street_and_number: "client_street_and_number",
    client_postal_code: "client_postal_code",
    client_city: "client_city",
    order_title: "order_title",
    offer_id: 1,
    items: [
      {
        id: 1,
        offer_document_id: "document_id",
        kind: ArticleKind.heading,
        title: "title1",
        description: "description1",
      },
      {
        id: 2,
        offer_document_id: "document_id",
        kind: ArticleKind.item,
        title: "title2",
        description: "description2",
        unit: "unit",
        price: 10,
        amount: 100,
      },
    ],
    offered_at: "1993-12-12",
    offer_valid_until: "1995-12-12",
  };
}

export async function getOverdueNoticeDocument(): Promise<OverdueNoticeDocument> {
  return {
    id: "document_id",
    created_at: 1,
    updated_at: 1,
    creation_date: "1992-12-12",
    client_id: "client_id",
    client_email: "client@mail.com",
    client_company_name: "client_company_name",
    client_first_name: "client_first_name",
    client_last_name: "client_last_name",
    client_street_and_number: "client_street_and_number",
    client_postal_code: "client_postal_code",
    client_city: "client_city",
    order_title: "order_title",
    overdue_notice_id: 1,
    notice_level: OverdueNoticeLevel.first,
    notice_date: "1993-12-12",
    payments_until: "1994-12-12",
    payment_target: "1995-12-12",
    notice_costs: 55,
    default_interest: 2.5,
    invoice_documents: [await getInvoiceDocument()],
  };
}

export function getClient(clientOverride: Partial<Client> = {}): Client {
  const client = {
    id: `K${Date.now() + Math.random()}`,
    created_at: 1,
    updated_at: 1,
    first_name: `First Name`,
    last_name: `Last Name`,
    salutation: ClientSalutation.mister_doctor,
    email: `email@local.com`,
    landline_phone: `+49 1111`,
    company_name: `Company`,
    birthday: `2021-01-01`,
    comment: `Comment`,
    mobile_phone: `+49 222`,
    postal_code: `postal code`,
    city: `city`,
    street_and_number: `street and number`,
  };

  return { ...client, ...clientOverride };
}

export async function getOrder(
  orderOverride: Partial<Order> = {},
  saveInDb?: DataSource,
): Promise<Order> {
  let client: Client;
  let clientId: string;

  if (orderOverride.client) {
    client = orderOverride.client;
    clientId = client.id;
  } else if (orderOverride.client_id) {
    clientId = orderOverride.client_id;
    client = getClient({ id: clientId });
  } else {
    client = getClient();
    clientId = client.id;
  }

  const order = {
    ...{
      id: `A${Date.now() + Math.random()}`,
      created_at: 1,
      updated_at: 1,
      status: OrderStatus.preparation,
      title: `Title`,
      client_id: clientId,
      client,
      description: `Description`,
      can_have_cash_discount: true,
      discount_duration: 1,
      discount_percentage: 2,
    },
    ...orderOverride,
  };

  if (saveInDb) {
    await saveInDb.getRepository(DbClient).save(order.client);
    await saveInDb.getRepository(DbOrder).save(order);
  }

  return order;
}

export async function getOffer(
  override: Partial<Offer> = {},
  saveInDb?: DataSource,
): Promise<Offer> {
  let order: Order;
  let orderId: string;

  if (override.order) {
    order = override.order;
    orderId = order.id;
  } else if (override.order_id) {
    orderId = override.order_id;
    order = await getOrder({ id: orderId }, saveInDb);
  } else {
    order = await getOrder({}, saveInDb);
    orderId = order.id;
  }

  const offer = {
    ...{
      id: Date.now(),
      created_at: 1,
      updated_at: 1,
      order_id: orderId,
      order,
      items: [],
      documents: [],
      status: OfferStatus.confirmed,
      description: `Description`,
      offered_at: `2021-01-01`,
      offer_valid_until: `2022-01-02`,
    },
    ...override,
  };

  if (saveInDb) {
    await saveInDb.getRepository(DbOffer).save(offer);
  }

  return offer;
}

export async function getInvoice(
  override: Partial<Invoice> = {},
  saveInDb?: DataSource,
): Promise<Invoice> {
  let order: Order;
  let orderId: string;

  if (override.order) {
    order = override.order;
    orderId = order.id;
  } else if (override.order_id) {
    orderId = override.order_id;
    order = await getOrder({ id: orderId }, saveInDb);
  } else {
    order = await getOrder({}, saveInDb);
    orderId = order.id;
  }

  const invoice = {
    ...{
      id: Date.now(),
      sub_id: "sub_id",
      created_at: 1,
      updated_at: 1,
      order_id: orderId,
      order,
      items: [],
      documents: [],
      description: `Description`,
      status: PaymentStatus.initial,
      invoice_date: `2021-01-01`,
      payment_target: `2022-01-02`,
      service_dates: [`2022-01-03`],
    },
    ...override,
  };

  if (saveInDb) {
    await saveInDb.getRepository(DbOrder).save(invoice.order);
    await saveInDb.getRepository(DbInvoice).save(invoice);
  }

  return invoice;
}

export async function getOverdueNotice(
  override: Partial<OverdueNotice> = {},
  saveInDb?: DataSource,
): Promise<OverdueNotice> {
  let order: Order;
  let orderId: string;

  if (override.order) {
    order = override.order;
    orderId = order.id;
  } else if (override.order_id) {
    orderId = override.order_id;
    order = await getOrder({ id: orderId }, saveInDb);
  } else {
    order = await getOrder({}, saveInDb);
    orderId = order.id;
  }

  const overdueNotice = {
    ...{
      id: Date.now(),
      sub_id: "sub_id",
      created_at: 1,
      updated_at: 1,
      order_id: orderId,
      order,
      invoice_documents: [],
      documents: [],
      description: `Description`,
      notice_date: `2021-01-01`,
      payments_until: `2022-01-02`,
      payment_target: `2022-01-03`,
      payment_status: OverdueNoticePaymentStatus.initial,
      notice_level: OverdueNoticeLevel.first,
      notice_costs: 1,
      default_interest: 2,
    },
    ...override,
  };

  if (saveInDb) {
    await saveInDb.getRepository(DbOverdueNotice).save(overdueNotice);
  }

  return overdueNotice;
}
