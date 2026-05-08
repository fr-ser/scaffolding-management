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

  @ManyToMany(() => InvoiceDocument)
  @JoinTable({
    name: "overdue_notice_invoice_document_junction",
    joinColumn: { name: "overdue_notice_id", referencedColumnName: "id" },
    inverseJoinColumn: {
      name: "invoice_document_id",
      referencedColumnName: "id",
    },
  })
  declare invoice_documents: InvoiceDocument[];

  @Column({ type: "text", nullable: true })
  declare sub_id: string;

  @Column({ type: "text", nullable: true })
  declare description: string;

  @Column({ type: "text" })
  declare notice_date: string;

  @Column({ type: "text" })
  declare payments_until: string;

  @Column({ type: "text" })
  declare payment_target: string;

  @Column({ type: "text" })
  declare notice_level: OverdueNoticeLevel;

  @Column({ type: "text" })
  declare payment_status: OverdueNoticePaymentStatus;

  @Column({ type: "real" })
  declare notice_costs: number;

  @Column({ type: "real", nullable: true })
  declare default_interest: number;
}
