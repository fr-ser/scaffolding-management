import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { InvoiceDocument, OfferDocument } from "@/db/entities/documents";
import { ArticleKind } from "@/global/types/appTypes";

abstract class DocumentItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  amount: number;
}

@Entity()
export class OfferDocumentItem extends DocumentItem {
  @Column()
  offer_document_id: string;

  @ManyToOne(() => OfferDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_document_id" })
  offer_document: OfferDocument;
}

@Entity()
export class InvoiceDocumentItem extends DocumentItem {
  @Column()
  invoice_document_id: string;

  @ManyToOne(() => InvoiceDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_document_id" })
  invoice_document: InvoiceDocument;
}
