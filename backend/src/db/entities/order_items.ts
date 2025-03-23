import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { ArticleKind } from "@/global/types/appTypes";

export abstract class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  description: string;

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
  offer_id: number;

  @ManyToOne(() => Offer, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_id" })
  offer: Offer;
}

@Entity()
export class InvoiceItem extends OrderItem {
  @Column({ type: "integer" })
  invoice_id: number;

  @ManyToOne(() => Invoice, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_id" })
  invoice: Invoice;
}
