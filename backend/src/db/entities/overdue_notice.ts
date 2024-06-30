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

  @Column()
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

  // TODO: this is only created for the migration. Delete it afterwards
  @Column()
  sub_id: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  notice_date: string;

  @Column()
  payments_until: string;

  @Column()
  payment_target: string;

  @Column({ type: "text" })
  notice_level: OverdueNoticeLevel;

  @Column({ type: "text" })
  payment_status: OverdueNoticePaymentStatus;

  @Column()
  notice_costs: number;

  @Column({ nullable: true })
  default_interest: number;
}
