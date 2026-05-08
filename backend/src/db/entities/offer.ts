import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { OfferDocument } from "@/db/entities/documents";
import { Order } from "@/db/entities/order";
import { OfferItem } from "@/db/entities/order_items";
import { OfferStatus } from "@/global/types/appTypes";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare updated_at: number;

  @Column({ type: "text" })
  declare order_id: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  declare order: Order;

  @Column({ type: "text" })
  declare status: OfferStatus;

  @Column({ type: "text", nullable: true })
  declare description: string;

  @Column({ type: "text" })
  declare offered_at: string;

  @Column({ type: "text" })
  declare offer_valid_until: string;

  @OneToMany(() => OfferItem, (offer_item) => offer_item.offer)
  declare items: OfferItem[];

  @OneToMany(() => OfferDocument, (offer_document) => offer_document.offer)
  declare documents: OfferDocument[];
}
