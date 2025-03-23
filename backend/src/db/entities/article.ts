import { Column, Entity, PrimaryColumn } from "typeorm";

import { ArticleKind } from "@/global/types/appTypes";

@Entity()
export class Article {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  created_at: number;

  @Column({ type: "real", default: () => "unixepoch('subsec')" })
  updated_at: number;

  @Column({ type: "text" })
  kind: ArticleKind;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  unit?: string;

  @Column({ type: "real", nullable: true })
  price?: number;
}
