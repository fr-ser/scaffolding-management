import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { Client } from "@/db/entities/client";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OrderStatus } from "@/global/types/appTypes";

@Entity()
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "client_id" })
  client: Client;

  @OneToOne(() => Offer, (offer) => offer.order)
  offer: Offer;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices: Invoice[];

  @OneToMany(() => OverdueNotice, (overdue_notice) => overdue_notice.order)
  overdue_notices: OverdueNotice[];

  @Column({ type: "text" })
  status: OrderStatus;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  can_have_cash_discount: boolean;

  @Column({ nullable: true })
  discount_duration: number;

  @Column({ nullable: true })
  discount_percentage: number;
}
