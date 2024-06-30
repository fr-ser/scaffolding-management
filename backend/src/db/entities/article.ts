import { Column, Entity, PrimaryColumn } from "typeorm";

import { ArticleKind } from "@/global/types/appTypes";

@Entity()
export class Article {
  @PrimaryColumn()
  id: string;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  price?: number;
}
