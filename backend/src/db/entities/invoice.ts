import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Order } from "@/db/entities/order";
import { InvoiceItem } from "@/db/entities/order_items";
import { PaymentStatus } from "@/global/types/appTypes";

@Entity()
export class Invoice {
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

  @Column({ type: "text", nullable: true })
  declare sub_id: string;

  @Column("simple-json")
  declare service_dates: string[];

  @Column({ type: "text" })
  declare invoice_date: string;

  @Column({ type: "text" })
  declare payment_target: string;

  @Column({ type: "text" })
  declare status: PaymentStatus;

  @Column({ type: "text", nullable: true })
  declare description: string;

  @OneToMany(() => InvoiceItem, (invoice_item) => invoice_item.invoice)
  declare items: InvoiceItem[];
}
