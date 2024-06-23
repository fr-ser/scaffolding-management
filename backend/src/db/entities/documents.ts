import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { InvoiceDocumentItem, OfferDocumentItem } from '@/db/entities/document_items'
import { Invoice } from '@/db/entities/invoice'
import { Offer } from '@/db/entities/offer'
import { OverdueNotice } from '@/db/entities/overdue_notice'
import { OverdueNoticeLevel } from '@/global/types/appTypes'

abstract class BaseDocument {
  @PrimaryColumn()
  id: string

  @Column()
  creation_date: string

  // The below data duplicates the data in their source entities.
  // It is duplicated to be historically consistent. I.e. it will stay the same in the
  // document even when the client data is updated (after the document is created)
  @Column()
  client_id: string

  @Column({ nullable: true })
  client_email?: string

  @Column({ nullable: true })
  client_company_name?: string

  @Column({ nullable: true })
  client_first_name?: string

  @Column({ nullable: true })
  client_last_name?: string

  @Column({ nullable: true })
  client_street_and_number?: string

  @Column({ nullable: true })
  client_postal_code?: string

  @Column({ nullable: true })
  client_city?: string

  @Column()
  order_title: string
}

@Entity()
export class OfferDocument extends BaseDocument {
  @Column()
  offer_id: string

  @ManyToOne(() => Offer)
  @JoinColumn({ name: 'offer_id' })
  offer: Offer

  @OneToMany(() => OfferDocumentItem, (offer_document_item) => offer_document_item.offer_document)
  items: OfferDocumentItem[]

  @Column()
  offered_at: string

  @Column()
  offer_valid_until: string
}

@Entity()
export class InvoiceDocument extends BaseDocument {
  @Column()
  invoice_id: string

  @ManyToOne(() => Invoice)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice

  @OneToMany(
    () => InvoiceDocumentItem,
    (invoice_document_item) => invoice_document_item.invoice_document,
  )
  items: InvoiceDocumentItem[]

  @Column('simple-json')
  service_dates: string[]

  @Column()
  payment_target: string

  @Column()
  can_have_cash_discount: boolean

  @Column({ nullable: true })
  discount_duration: number

  @Column({ nullable: true })
  discount_percentage: number
}

@Entity()
export class OverdueNoticeDocument extends BaseDocument {
  @Column()
  overdue_notice_id: string

  @ManyToOne(() => OverdueNotice)
  @JoinColumn({ name: 'overdue_notice_id' })
  overdue_notice: OverdueNotice

  @Column({ type: 'text' })
  notice_level: OverdueNoticeLevel

  @Column()
  notice_date: string

  @Column()
  payments_until: string

  @Column()
  payment_target: string

  @Column()
  notice_costs: number

  @Column({ nullable: true })
  default_interest: number

  @ManyToMany(() => InvoiceDocument)
  @JoinTable({
    name: 'overdue_notice_document_invoice_document_junction',
    joinColumn: {
      name: 'overdue_notice_document_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'invoice_document_id',
      referencedColumnName: 'id',
    },
  })
  invoice_documents: InvoiceDocument[]
}
