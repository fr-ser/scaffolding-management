import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Order } from "@/db/entities/order";
import { InvoiceItem } from "@/db/entities/order_items";
import { PaymentStatus } from "@/global/types/appTypes";

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  // TODO: this is only created for the migration. Delete it afterwards
  @Column()
  sub_id: string;

  @Column("simple-json")
  service_dates: string[];

  @Column()
  invoice_date: string;

  @Column()
  payment_target: string;

  @Column({ type: "text" })
  status: PaymentStatus;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => InvoiceItem, (invoice_item) => invoice_item.invoice)
  items: InvoiceItem[];
}
