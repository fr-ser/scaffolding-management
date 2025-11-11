import { OrderStatus } from "@/global/types/appTypes";

export const FrontendOrderStatusMap = {
  [OrderStatus.offer]: "Angebot",
  [OrderStatus.preparation]: "Aufgebaut",
  [OrderStatus.finished]: "Fertig",
  [OrderStatus.deconstructed]: "Abgebaut",
  [OrderStatus.blocked]: "Gesperrt",
} as { [key in OrderStatus]: string };
