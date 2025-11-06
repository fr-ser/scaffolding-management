/**
 * Finds the first unused positive integer at the end of a dash-separated ID string array.
 *
 * Expects input like: ["R2023-10-01", "R-2023-10-02", "2023-10-03"]
 * Will extract the last dash-separated part, parse as integer, and return the lowest unused number.
 *
 * @param ids Array of strings, each representing an ID with a dash-separated number at the end.
 * @returns The first unused positive integer not present as the last dash-separated part of any ID.
 */
export function findFirstUnusedNumber(ids: string[]): number {
  const usedNumbers = new Set<number>();

  for (const id of ids) {
    const idParts = id.split("-");
    const num = parseInt(idParts[idParts.length - 1]);
    usedNumbers.add(num);
  }

  let firstUnused = 1;
  while (usedNumbers.has(firstUnused)) {
    firstUnused++;
  }
  return firstUnused;
}
