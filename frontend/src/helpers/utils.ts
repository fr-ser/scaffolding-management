import { format } from "date-fns";

import { round } from "@/global/helpers";

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

export function getUniqueArray<T>(array: Array<T>) {
  return array.filter(function (item, i, ar) {
    return ar.indexOf(item) === i;
  });
}

/**
 * The function takes a numeric string (german)
 * and returns the number or null (if it cannot be parsed)
 * @param strNum numeric string
 * @param precision optional precision of output
 */
export function strToFloat(strNum: string, precision?: number): number {
  const cleanStr = strNum.replace(/[\s.]/g, "").replace(",", ".");
  const parsedNum = parseFloat(cleanStr);

  if (typeof precision === "number") return round(parsedNum, precision);
  else return parsedNum;
}

export function getDateForDOM(date: Date) {
  const temp = date;
  return (
    temp.getFullYear() +
    "-" +
    ("00" + (temp.getMonth() + 1)).slice(-2) +
    "-" +
    ("00" + temp.getDate()).slice(-2)
  );
}

export function isNumeric(varParameter: any): boolean {
  return (
    !isNaN(parseFloat(varParameter)) &&
    isFinite(varParameter) &&
    !(typeof varParameter === "string" && varParameter.trim() === "")
  );
}

export const dateAddDays = function (initDate: Date, addDays: number) {
  const newDate = new Date(initDate);
  newDate.setDate(newDate.getDate() + addDays);
  return newDate;
};

export function parseJSONsafe(presumedJSON: string): any | null {
  try {
    return JSON.parse(presumedJSON);
  } catch (error) {
    return null;
  }
}

export function formatDateToIsoString(dateToIsoString: Date) {
  return format(dateToIsoString, "yyyy-MM-dd");
}
