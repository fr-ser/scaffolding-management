import { Column, Entity, PrimaryColumn } from "typeorm";

import { ArticleKind } from "@/global/types/appTypes";

@Entity()
export class Article {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  unit?: string;

  @Column({ type: "numeric", nullable: true })
  price?: number;
}
