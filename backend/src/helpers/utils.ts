import {
  CreditNoteDocument,
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

type AnyDocumentRecord =
  | OfferDocument
  | InvoiceDocument
  | OverdueNoticeDocument
  | CreditNoteDocument;

export function mergeSortedDocuments(
  ...args: [...AnyDocumentRecord[][], { isAscending: boolean; maxItems: number }]
) {
  const options = args[args.length - 1] as { isAscending: boolean; maxItems: number };
  const arrays = args.slice(0, -1) as AnyDocumentRecord[][];
  const { isAscending, maxItems } = options;

  // Merge all pre-sorted arrays using a pointer-based n-way merge
  const pointers = arrays.map(() => 0);
  const mergedArray: AnyDocumentRecord[] = [];
  const totalItems = arrays.reduce((sum, arr) => sum + arr.length, 0);

  while (mergedArray.length < totalItems) {
    let bestIndex = -1;
    let bestValue: AnyDocumentRecord | null = null;

    for (let i = 0; i < arrays.length; i++) {
      if (pointers[i] >= arrays[i].length) continue;
      const candidate = arrays[i][pointers[i]];
      if (
        bestValue === null ||
        (isAscending
          ? candidate.created_at < bestValue.created_at
          : candidate.created_at > bestValue.created_at)
      ) {
        bestIndex = i;
        bestValue = candidate;
      }
    }

    if (bestIndex === -1) break;

    mergedArray.push(bestValue!);
    pointers[bestIndex]++;

    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  return mergedArray;
}
