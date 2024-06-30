import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { OfferDocument } from "@/db/entities/documents";
import { Order } from "@/db/entities/order";
import { OfferItem } from "@/db/entities/order_items";
import { OfferStatus } from "@/global/types/appTypes";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: string;

  @OneToOne(() => Order)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "text" })
  status: OfferStatus;

  @Column({ nullable: true })
  description: string;

  @Column()
  offered_at: string;

  @Column()
  offer_valid_until: string;

  @OneToMany(() => OfferItem, (offer_item) => offer_item.offer)
  items: OfferItem[];

  @OneToMany(() => OfferDocument, (offer_document) => offer_document.offer)
  documents: OfferDocument[];
}
