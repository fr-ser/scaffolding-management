/**
 * This function is for compile time checking of completeness of if statements
 * It needs to be passed the parameter, that has been checked exhaustively
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function neverFunction(_: never): never {
  throw new Error("This function should not have been called.");
}

interface GetVatRateOptions {
  isoDate?: string;
}
/**
 * getVatRate returns the correct full German VAT rate (e.g. 0.19) depending on the date
 * Arguments can be the isoDate as string, a document or a subitem (invoice/order)
 */
export function getVatRate(options: GetVatRateOptions): number {
  const { isoDate } = options;
  if (isoDate === "") {
    return 0.19;
  }

  let dateToConvert: string;
  if (isoDate !== undefined) {
    dateToConvert = isoDate;
  } else {
    throw `Wrong argument received ${JSON.stringify(options)}`;
  }

  const realDate = new Date(dateToConvert);
  // The German government decided to lower the VAT rate for three months (because why not)
  const start16VAT = new Date("2020-07-01");
  const end16VAT = new Date("2020-12-31");

  if (realDate >= start16VAT && realDate <= end16VAT) {
    return 0.16;
  } else {
    return 0.19;
  }
}

export function formatNumber(
  number: number,
  options: { currency?: boolean; decimals?: number } = { currency: false, decimals: 0 },
): string {
  let chosenDecimals: number;
  if (options?.decimals) {
    chosenDecimals = options.decimals;
  } else if (options?.currency) {
    chosenDecimals = 2;
  } else {
    chosenDecimals = 0;
  }

  let result = number.toLocaleString("de-DE", {
    minimumFractionDigits: chosenDecimals,
    maximumFractionDigits: chosenDecimals,
  });

  if (options?.currency) {
    result = `${result} €`;
  }
  return result;
}

export function round(number: number, decimals: number = 0): number {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function formatIsoDateString(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("de-DE");
}
export function getNetAmount(item?: number, price?: number) {
  if (item && price) {
    return item * price;
  } else {
    return undefined;
  }
}
export function getVatAmount(amount?: number, price?: number, date?: string) {
  const netto = getNetAmount(amount, price);

  if (netto) {
    return netto * getVatRate({ isoDate: date });
  } else {
    return undefined;
  }
}
