import { format } from "date-fns";

import { formatNumber, getVatRate, round } from "@/global/helpers";
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

// TODO: remove this helper
export function calculateItemSumPrice(
  arrayItems: (OfferItem | OfferItemCreate)[],
  date: string = "",
) {
  let amountNet = 0;
  let amountGross = 0;
  let amountVat = 0;

  for (const item of arrayItems) {
    const amount = item.amount ?? 0;
    const price = item.price ?? 0;

    const netPrice = round(amount * price, 2);
    const grossPrice = round(netPrice * (1 + getVatRate({ isoDate: date })), 2);

    amountNet += netPrice;
    amountGross += grossPrice;
    amountVat += round(grossPrice - netPrice, 2);
  }

  return {
    amountNet: getFormattedAmount(amountNet),
    amountGross: getFormattedAmount(amountGross),
    amountVat: getFormattedAmount(amountVat),
  };
}

export function getGrossAmount(item: OfferItem | OfferItemCreate, date: string) {
  if (item.amount && item.price) {
    return item.amount * item.price * (1 + getVatRate({ isoDate: date }));
  } else {
    return undefined;
  }
}

export function getFormattedAmount(result?: number) {
  if (result) {
    return formatNumber(result, { decimals: 2, currency: true });
  } else {
    return "-";
  }
}
