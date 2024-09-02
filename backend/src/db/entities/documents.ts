import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

import { InvoiceDocumentItem, OfferDocumentItem } from "@/db/entities/document_items";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OverdueNoticeLevel } from "@/global/types/appTypes";

abstract class BaseDocument {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  creation_date: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  created_at: number;

  // TODO: Add onUpdate trigger (and for all other entities)
  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  updated_at: number;

  // The below data duplicates the data in their source entities.
  // It is duplicated to be historically consistent. I.e. it will stay the same in the
  // document even when the client data is updated (after the document is created)
  @Column({ type: "text" })
  client_id: string;

  @Column({ type: "text", nullable: true })
  client_email?: string;

  @Column({ type: "text", nullable: true })
  client_company_name?: string;

  @Column({ type: "text", nullable: true })
  client_first_name?: string;

  @Column({ type: "text", nullable: true })
  client_last_name?: string;

  @Column({ type: "text", nullable: true })
  client_street_and_number?: string;

  @Column({ type: "text", nullable: true })
  client_postal_code?: string;

  @Column({ type: "text", nullable: true })
  client_city?: string;

  @Column({ type: "text" })
  order_title: string;
}

@Entity()
export class OfferDocument extends BaseDocument {
  @Column({ type: "text" })
  offer_id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: "offer_id" })
  offer: Offer;

  @OneToMany(() => OfferDocumentItem, (offer_document_item) => offer_document_item.offer_document)
  items: OfferDocumentItem[];

  @Column({ type: "text" })
  offered_at: string;

  @Column({ type: "text" })
  offer_valid_until: string;
}

@Entity()
export class InvoiceDocument extends BaseDocument {
  @Column({ type: "text" })
  invoice_id: number;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: "invoice_id" })
  invoice: Invoice;

  @OneToMany(
    () => InvoiceDocumentItem,
    (invoice_document_item) => invoice_document_item.invoice_document,
  )
  items: InvoiceDocumentItem[];

  @Column("simple-json")
  service_dates: string[];

  @Column({ type: "text" })
  payment_target: string;

  @Column({ type: "boolean" })
  can_have_cash_discount: boolean;

  @Column({ type: "numeric", nullable: true })
  discount_duration: number;

  @Column({ type: "numeric", nullable: true })
  discount_percentage: number;

  @ManyToMany(() => OverdueNotice)
  overdue_notices: OverdueNotice[];
}

@Entity()
export class OverdueNoticeDocument extends BaseDocument {
  @Column({ type: "text" })
  overdue_notice_id: number;

  @ManyToOne(() => OverdueNotice)
  @JoinColumn({ name: "overdue_notice_id" })
  overdue_notice: OverdueNotice;

  @Column({ type: "text" })
  notice_level: OverdueNoticeLevel;

  @Column({ type: "text" })
  notice_date: string;

  @Column({ type: "text" })
  payments_until: string;

  @Column({ type: "text" })
  payment_target: string;

  @Column({ type: "numeric" })
  notice_costs: number;

  @Column({ type: "numeric", nullable: true })
  default_interest: number;

  @ManyToMany(() => InvoiceDocument)
  @JoinTable({
    name: "overdue_notice_document_invoice_document_junction",
    joinColumn: {
      name: "overdue_notice_document_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "invoice_document_id",
      referencedColumnName: "id",
    },
  })
  invoice_documents: InvoiceDocument[];
}
