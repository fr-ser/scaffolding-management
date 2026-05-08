import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Order } from "@/db/entities/order";
import { CreditNoteItem } from "@/db/entities/order_items";
import { PaymentStatus } from "@/global/types/appTypes";

@Entity()
export class CreditNote {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare updated_at: number;

  @Column({ type: "text" })
  declare order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  declare order: Order;

  @Column({ type: "text" })
  declare credit_date: string;

  @Column({ type: "text" })
  declare status: PaymentStatus;

  @Column({ type: "text", nullable: true })
  declare description: string;

  @Column("simple-json", { nullable: true })
  declare referenced_invoice_document_ids: string[];

  @OneToMany(() => CreditNoteItem, (item) => item.credit_note)
  declare items: CreditNoteItem[];
}
