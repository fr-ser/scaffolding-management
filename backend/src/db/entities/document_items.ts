import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { InvoiceDocument, OfferDocument } from "@/db/entities/documents";
import { ArticleKind } from "@/global/types/appTypes";

abstract class DocumentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  unit: string;

  @Column({ type: "real", nullable: true })
  price: number;

  @Column({ type: "real", nullable: true })
  amount: number;
}

@Entity()
export class OfferDocumentItem extends DocumentItem {
  @Column({ type: "text" })
  offer_document_id: string;

  @ManyToOne(() => OfferDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_document_id" })
  offer_document: OfferDocument;
}

@Entity()
export class InvoiceDocumentItem extends DocumentItem {
  @Column({ type: "text" })
  invoice_document_id: string;

  @ManyToOne(() => InvoiceDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_document_id" })
  invoice_document: InvoiceDocument;
}
