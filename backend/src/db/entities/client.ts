import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { ClientSalutation } from "@/global/types/appTypes";

import { Order } from "./order";

@Entity()
export class Client {
  @PrimaryColumn({ type: "text" })
  declare id: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare updated_at: number;

  @Column({ type: "text", nullable: true })
  salutation?: ClientSalutation;

  @Column({ type: "text", nullable: true })
  email?: string;

  @Column({ type: "text", nullable: true })
  landline_phone?: string;

  @Column({ type: "text", nullable: true })
  company_name?: string;

  @Column({ type: "text", nullable: true })
  birthday?: string;

  @Column({ type: "text", nullable: true })
  comment?: string;

  @Column({ type: "text", nullable: true })
  mobile_phone?: string;

  @Column({ type: "text", nullable: true })
  first_name?: string;

  @Column({ type: "text", nullable: true })
  last_name?: string;

  @Column({ type: "text", nullable: true })
  postal_code?: string;

  @Column({ type: "text", nullable: true })
  city?: string;

  @Column({ type: "text", nullable: true })
  street_and_number?: string;

  @Column({ type: "text", default: "DE" })
  declare country: string;

  @Column({ type: "boolean", default: false })
  declare reverse_vat: boolean;

  @Column({ type: "text", nullable: true })
  vat_id?: string | null;

  @OneToMany(() => Order, (order) => order.client)
  orders?: Order[];
}
