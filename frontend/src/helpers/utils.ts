import { format } from "date-fns";

import { getVatRate } from "@/global/helpers";
import type { OfferItemCreate } from "@/global/types/dataEditTypes";
import type { OfferItem } from "@/global/types/entities";

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
): (...args: T) => void {
  let timeoutID: number;

  if (!Number.isInteger(wait)) {
    console.warn("Called debounce without a valid number");
    wait = 300;
  }

  return (...args: T) => {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
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

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message || "ValidationError");
    this.name = "ValidationError";
  }
}

/**
 * This function replaces all empty strings in an object with null.
 * The primary use of this is to clean up data before sending it to the backend.
 */
export function replaceEmptyStringsWithNull<T extends object>(data: T): T {
  const result: Record<string, unknown> = {};
  const untypedData = data as Record<string, unknown>;
  Object.keys(data).forEach((key) => {
    result[key] = untypedData[key] === "" ? null : untypedData[key];
  });
  return result as T;
}

/**
 * This function finds the nearest scrollable parent of an element.
 */
export function getScrollableParent(el: HTMLElement | null): HTMLElement | null {
  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollable = overflowY === "auto" || overflowY === "scroll";

    if (isScrollable && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
