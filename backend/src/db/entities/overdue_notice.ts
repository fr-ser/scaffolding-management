import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { InvoiceDocument } from "@/db/entities/documents";
import { Order } from "@/db/entities/order";
import { OverdueNoticeLevel, OverdueNoticePaymentStatus } from "@/global/types/appTypes";

@Entity()
export class OverdueNotice {
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

  @ManyToMany(() => InvoiceDocument)
  @JoinTable({
    name: "overdue_notice_invoice_document_junction",
    joinColumn: { name: "overdue_notice_id", referencedColumnName: "id" },
    inverseJoinColumn: {
      name: "invoice_document_id",
      referencedColumnName: "id",
    },
  })
  invoice_documents: InvoiceDocument[];

  // TODO: this is only created for the move from the old to the new app. Delete it afterwards
  @Column({ type: "text" })
  sub_id: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text" })
  notice_date: string;

  @Column({ type: "text" })
  payments_until: string;

  @Column({ type: "text" })
  payment_target: string;

  @Column({ type: "text" })
  notice_level: OverdueNoticeLevel;

  @Column({ type: "text" })
  payment_status: OverdueNoticePaymentStatus;

  @Column({ type: "numeric" })
  notice_costs: number;

  @Column({ type: "numeric", nullable: true })
  default_interest: number;
}
