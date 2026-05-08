import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { Client } from "@/db/entities/client";
import { CreditNote } from "@/db/entities/credit_note";
import { Invoice } from "@/db/entities/invoice";
import { Offer } from "@/db/entities/offer";
import { OverdueNotice } from "@/db/entities/overdue_notice";
import { OrderStatus } from "@/global/types/appTypes";

@Entity()
export class Order {
  @PrimaryColumn({ type: "text" })
  declare id: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({
    type: "real",
    default: () => "unixepoch('subsec')",
    onUpdate: "unixepoch('subsec')",
  })
  declare updated_at: number;

  @Column({ type: "text" })
  declare client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: "client_id" })
  declare client: Client;

  @OneToOne(() => Offer, (offer) => offer.order)
  declare offer: Offer;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  declare invoices: Invoice[];

  @OneToMany(() => OverdueNotice, (overdue_notice) => overdue_notice.order)
  declare overdue_notices: OverdueNotice[];

  @OneToMany(() => CreditNote, (credit_note) => credit_note.order)
  declare credit_notes: CreditNote[];

  @Column({ type: "text" })
  declare status: OrderStatus;

  @Column({ type: "text" })
  declare title: string;

  @Column({ type: "text", nullable: true })
  declare description: string;

  @Column({ type: "boolean" })
  declare can_have_cash_discount: boolean;

  @Column({ type: "real", nullable: true })
  declare discount_duration: number;

  @Column({ type: "real", nullable: true })
  declare discount_percentage: number;
}
