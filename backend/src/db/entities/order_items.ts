import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CreditNote } from "@/db/entities/credit_note";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { ArticleKind } from "@/global/types/appTypes";

export abstract class OrderItem {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "text" })
  declare kind: ArticleKind;

  @Column({ type: "text" })
  declare title: string;

  @Column({ type: "text" })
  declare description: string;

  @Column({ type: "text", nullable: true })
  unit?: string;

  @Column({ type: "real", nullable: true })
  price?: number;

  @Column({ type: "real", nullable: true })
  amount?: number;
}

@Entity()
export class OfferItem extends OrderItem {
  @Column({ type: "integer" })
  declare offer_id: number;

  @ManyToOne(() => Offer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_id" })
  declare offer: Offer;
}

@Entity()
export class InvoiceItem extends OrderItem {
  @Column({ type: "integer" })
  declare invoice_id: number;

  @ManyToOne(() => Invoice, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  declare invoice: Invoice;
}

@Entity()
export class CreditNoteItem extends OrderItem {
  @Column({ type: "integer" })
  declare credit_note_id: number;

  @ManyToOne(() => CreditNote, { onDelete: "CASCADE" })
  @JoinColumn({ name: "credit_note_id" })
  declare credit_note: CreditNote;
}
