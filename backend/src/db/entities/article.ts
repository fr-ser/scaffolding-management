import { Column, Entity, PrimaryColumn } from "typeorm";

import { ArticleKind } from "@/global/types/appTypes";

@Entity()
export class Article {
  @PrimaryColumn({ type: "text" })
  declare id: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  declare updated_at: number;

  @Column({ type: "text" })
  declare kind: ArticleKind;

  @Column({ type: "text" })
  declare title: string;

  @Column({ type: "text" })
  declare description: string;

  @Column({ type: "text", nullable: true })
  unit?: string;

  @Column({ type: "real", nullable: true })
  price?: number;
}
