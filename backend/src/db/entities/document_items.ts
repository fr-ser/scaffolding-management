import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CreditNoteDocument, InvoiceDocument, OfferDocument } from "@/db/entities/documents";
import { ArticleKind } from "@/global/types/appTypes";

abstract class DocumentItem {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "text" })
  declare kind: ArticleKind;

  @Column({ type: "text" })
  declare title: string;

  @Column({ type: "text" })
  declare description: string;

  @Column({ type: "text", nullable: true })
  declare unit: string;

  @Column({ type: "real", nullable: true })
  declare price: number;

  @Column({ type: "real", nullable: true })
  declare amount: number;
}

@Entity()
export class OfferDocumentItem extends DocumentItem {
  @Column({ type: "text" })
  declare offer_document_id: string;

  @ManyToOne(() => OfferDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_document_id" })
  declare offer_document: OfferDocument;
}

@Entity()
export class InvoiceDocumentItem extends DocumentItem {
  @Column({ type: "text" })
  declare invoice_document_id: string;

  @ManyToOne(() => InvoiceDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "invoice_document_id" })
  declare invoice_document: InvoiceDocument;
}

@Entity()
export class CreditNoteDocumentItem extends DocumentItem {
  @Column({ type: "text" })
  declare credit_note_document_id: string;

  @ManyToOne(() => CreditNoteDocument, { onDelete: "CASCADE" })
  @JoinColumn({ name: "credit_note_document_id" })
  declare credit_note_document: CreditNoteDocument;
}
