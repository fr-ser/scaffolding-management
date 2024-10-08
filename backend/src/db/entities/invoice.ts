import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Order } from "@/db/entities/order";
import { InvoiceItem } from "@/db/entities/order_items";
import { PaymentStatus } from "@/global/types/appTypes";

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  created_at: number;

  // TODO: Add onUpdate trigger (and for all other entities)
  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  updated_at: number;

  @Column({ type: "text" })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  // TODO: this is only created for the move from the old to the new app. Delete it afterwards
  @Column({ type: "text" })
  sub_id: string;

  @Column("simple-json")
  service_dates: string[];

  @Column({ type: "text" })
  invoice_date: string;

  @Column({ type: "text" })
  payment_target: string;

  @Column({ type: "text" })
  status: PaymentStatus;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => InvoiceItem, (invoice_item) => invoice_item.invoice)
  items: InvoiceItem[];
}
