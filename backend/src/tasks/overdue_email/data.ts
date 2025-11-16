import { DataSource, In, LessThan } from "typeorm";

import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { Order } from "@/db/entities/order";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import {
  OfferStatus,
  OrderStatus,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";

export async function getBlockedOrders(dataSource: DataSource) {
  return await dataSource.manager.find(Order, { where: { status: OrderStatus.blocked } });
}

export async function getOverdueOffers(dataSource: DataSource) {
  return await dataSource.manager.find(Offer, {
    relations: ["order"],
    where: {
      status: OfferStatus.created,
      offer_valid_until: LessThan(new Date().toISOString().split("T")[0]),
    },
  });
}

export async function getOverdueInvoices(dataSource: DataSource) {
  return await dataSource.manager.find(Invoice, {
    relations: ["order"],
    where: {
      status: PaymentStatus.open,
      payment_target: LessThan(new Date().toISOString().split("T")[0]),
    },
  });
}

export async function getOverdueOverdueNotices(dataSource: DataSource) {
  return await dataSource.manager.find(OverdueNotice, {
    relations: ["order"],
    where: {
      payment_target: LessThan(new Date().toISOString().split("T")[0]),
      payment_status: In([
        OverdueNoticePaymentStatus.open,
        OverdueNoticePaymentStatus.partiallyPaid,
      ]),
    },
  });
}
