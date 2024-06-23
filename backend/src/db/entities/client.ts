import { Order } from './order'
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

import { ClientSalutation } from '@/global/types/appTypes'

@Entity()
export class Client {
  @PrimaryColumn()
  id: string

  @Column({ nullable: true, type: 'text' })
  salutation?: ClientSalutation

  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  landline_phone?: string

  @Column({ nullable: true })
  company_name?: string

  @Column({ nullable: true })
  birthday?: string

  @Column({ nullable: true })
  comment?: string

  @Column({ nullable: true })
  mobile_phone?: string

  @Column({ nullable: true })
  first_name?: string

  @Column({ nullable: true })
  last_name?: string

  @Column({ nullable: true })
  postal_code?: string

  @Column({ nullable: true })
  city?: string

  @Column({ nullable: true })
  street_and_number?: string

  @OneToMany(() => Order, (order) => order.client)
  orders?: Order[]
}
