/**
 * This function is for compile time checking of completeness of if statements
 * It needs to be passed the parameter, that has been checked exhaustively
 */
export function neverFunction(x?: never): never {
  throw new Error("This function should not have been called.");
}

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
  var emailRegExp = /^[a-zA-Z0-9.#*+_-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return emailRegExp.test(strEMail);
}

export function getUniqueArray<T>(array: Array<T>) {
  return array.filter(function (item, i, ar) {
    return ar.indexOf(item) === i;
  });
}

export function round(number: number, precision: number): number {
  // taken from mdn - no idea how this works
  var factor = Math.pow(10, precision);
  var tempNumber = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
}

/**
 * The function takes a numeric string (german)
 * and returns the number or null (if it cannot be parsed)
 * @param strNum numeric string
 * @param precision optional precision of output
 */
export function strToFloat(strNum: string, precision?: number): number {
  const cleanStr = strNum.replace(/[\s\.]/g, "").replace(",", ".");
  const parsedNum = parseFloat(cleanStr);

  if (typeof precision === "number") return round(parsedNum, precision);
  else return parsedNum;
}

export function getDateForDOM(date: Date) {
  var temp = date;
  return temp.getFullYear() + "-" + ("00" + (temp.getMonth() + 1)).slice(-2) + "-" + ("00" + temp.getDate()).slice(-2);
}


export function isNumeric(varParameter: any): boolean {
  return (
    !isNaN(parseFloat(varParameter)) &&
    isFinite(varParameter) &&
    !(typeof varParameter === "string" && varParameter.trim() === "")
  );
}

export const dateAddDays = function (initDate: Date, addDays: number) {
  let newDate = new Date(initDate);
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
