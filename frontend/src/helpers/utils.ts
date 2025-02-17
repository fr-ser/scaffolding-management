import { format } from "date-fns";

import { getVatRate } from "@/global/helpers";
import type { OfferItemCreate } from "@/global/types/dataEditTypes";
import type { OfferItem } from "@/global/types/entities";

export function debounce<F extends Function>(func: F, wait: number): F {
  let timeoutID: number;

  if (!Number.isInteger(wait)) {
    console.warn("Called debounce without a valid number");
    wait = 300;
  }

  // conversion through any necessary as it wont satisfy criteria otherwise
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutID);
    const context = this;

    timeoutID = window.setTimeout(function () {
      func.apply(context, args);
    }, wait);
  } as any;
}

export function validEMail(strEMail: string) {
  const emailRegExp = /^[a-zA-Z0-9.#*+_-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)+$/;
  return emailRegExp.test(strEMail);
}

/**
 * This function formats a Date input into an ISO date string (e.g. Date(123456) -> "2021-12-31")
 */
export function formatDateToIsoString(dateToIsoString: Date) {
  return format(dateToIsoString, "yyyy-MM-dd");
}

export function getGrossAmount(item: OfferItem | OfferItemCreate, date: string) {
  if (item.amount && item.price) {
    return item.amount * item.price * (1 + getVatRate({ isoDate: date }));
  } else {
    return undefined;
  }
}
