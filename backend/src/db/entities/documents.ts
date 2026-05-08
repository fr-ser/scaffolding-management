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

import { CreditNote } from "@/db/entities/credit_note";
import {
  CreditNoteDocumentItem,
  InvoiceDocumentItem,
  OfferDocumentItem,
} from "@/db/entities/document_items";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OverdueNoticeLevel } from "@/global/types/appTypes";

abstract class BaseDocument {
  @PrimaryColumn({ type: "text" })
  declare id: string;

  @Column({ type: "text" })
  declare creation_date: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare updated_at: number;

  @Column({ type: "text" })
  declare order_id: string;

  // The below data duplicates the data in their source entities.
  // It is duplicated to be historically consistent. I.e. it will stay the same in the
  // document even when the client data is updated (after the document is created)
  @Column({ type: "text" })
  declare client_id: string;

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
  declare order_title: string;
}

@Entity()
export class OfferDocument extends BaseDocument {
  @Column({ type: "text" })
  declare offer_id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: "offer_id" })
  declare offer: Offer;

  @OneToMany(() => OfferDocumentItem, (offer_document_item) => offer_document_item.offer_document)
  declare items: OfferDocumentItem[];

  @Column({ type: "text" })
  declare offered_at: string;

  @Column({ type: "text" })
  declare offer_valid_until: string;
}

@Entity()
export class InvoiceDocument extends BaseDocument {
  @Column({ type: "text" })
  declare invoice_id: number;

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: "invoice_id" })
  declare invoice: Invoice;

  @OneToMany(
    () => InvoiceDocumentItem,
    (invoice_document_item) => invoice_document_item.invoice_document,
  )
  declare items: InvoiceDocumentItem[];

  @Column("simple-json")
  declare service_dates: string[];

  @Column({ type: "text" })
  declare invoice_date: string;

  @Column({ type: "text" })
  declare payment_target: string;

  @Column({ type: "boolean" })
  declare can_have_cash_discount: boolean;

  @Column({ type: "real", nullable: true })
  declare discount_duration: number;

  @Column({ type: "real", nullable: true })
  declare discount_percentage: number;

  @ManyToMany(() => OverdueNotice)
  declare overdue_notices: OverdueNotice[];
}

@Entity()
export class CreditNoteDocument extends BaseDocument {
  @Column({ type: "text" })
  declare credit_note_id: number;

  @ManyToOne(() => CreditNote)
  @JoinColumn({ name: "credit_note_id" })
  declare credit_note: CreditNote;

  @OneToMany(
    () => CreditNoteDocumentItem,
    (credit_note_document_item) => credit_note_document_item.credit_note_document,
  )
  declare items: CreditNoteDocumentItem[];

  @Column({ type: "text" })
  declare credit_date: string;
}

@Entity()
export class OverdueNoticeDocument extends BaseDocument {
  @Column({ type: "text" })
  declare overdue_notice_id: number;

  @ManyToOne(() => OverdueNotice)
  @JoinColumn({ name: "overdue_notice_id" })
  declare overdue_notice: OverdueNotice;

  @Column({ type: "text" })
  declare notice_level: OverdueNoticeLevel;

  @Column({ type: "text" })
  declare notice_date: string;

  @Column({ type: "text" })
  declare payments_until: string;

  @Column({ type: "text" })
  declare payment_target: string;

  @Column({ type: "real" })
  declare notice_costs: number;

  @Column({ type: "real", nullable: true })
  declare default_interest: number;

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
  declare invoice_documents: InvoiceDocument[];
}
