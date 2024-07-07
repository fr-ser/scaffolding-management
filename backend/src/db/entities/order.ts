import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { Client } from "@/db/entities/client";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OrderStatus } from "@/global/types/appTypes";

@Entity()
export class Order {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
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

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean" })
  can_have_cash_discount: boolean;

  @Column({ type: "numeric", nullable: true })
  discount_duration: number;

  @Column({ type: "numeric", nullable: true })
  discount_percentage: number;
}
