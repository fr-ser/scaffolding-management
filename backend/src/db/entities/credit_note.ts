import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Order } from "@/db/entities/order";
import { CreditNoteItem } from "@/db/entities/order_items";
import { PaymentStatus } from "@/global/types/appTypes";

@Entity()
export class CreditNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  updated_at: number;

  @Column({ type: "text" })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "text" })
  credit_date: string;

  @Column({ type: "text" })
  status: PaymentStatus;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column("simple-json", { nullable: true })
  referenced_invoice_document_ids: string[];

  @OneToMany(() => CreditNoteItem, (item) => item.credit_note)
  items: CreditNoteItem[];
}
