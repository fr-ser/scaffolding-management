import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/global/types/entities";

export function mergeSortedDocuments(
  arr1: OfferDocument[] | InvoiceDocument[] | OverdueNoticeDocument[],
  arr2: OfferDocument[] | InvoiceDocument[] | OverdueNoticeDocument[],
  arr3: OfferDocument[] | InvoiceDocument[] | OverdueNoticeDocument[],
  options: { isAscending: boolean; maxItems: number },
) {
  const { isAscending, maxItems } = options;

  // Comparison function based on order and [itemProperty] property
  const compare = (
    a: OfferDocument | InvoiceDocument | OverdueNoticeDocument,
    b: OfferDocument | InvoiceDocument | OverdueNoticeDocument,
  ) => {
    return isAscending ? a.created_at < b.created_at : a.created_at > b.created_at;
  };

  const mergedArray = [];
  let i = 0,
    j = 0,
    k = 0;

  // Compare elements from all three arrays and add the smallest/largest one to mergedArray
  while (i < arr1.length && j < arr2.length && k < arr3.length) {
    if (compare(arr1[i], arr2[j]) && compare(arr1[i], arr3[k])) {
      mergedArray.push(arr1[i]);
      i++;
    } else if (compare(arr2[j], arr1[i]) && compare(arr2[j], arr3[k])) {
      mergedArray.push(arr2[j]);
      j++;
    } else {
      mergedArray.push(arr3[k]);
      k++;
    }
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Merge remaining elements from arr1 and arr2
  while (i < arr1.length && j < arr2.length) {
    if (compare(arr1[i], arr2[j])) {
      mergedArray.push(arr1[i]);
      i++;
    } else {
      mergedArray.push(arr2[j]);
      j++;
    }
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Merge remaining elements from arr1 and arr3
  while (i < arr1.length && k < arr3.length) {
    if (compare(arr1[i], arr3[k])) {
      mergedArray.push(arr1[i]);
      i++;
    } else {
      mergedArray.push(arr3[k]);
      k++;
    }
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Merge remaining elements from arr2 and arr3
  while (j < arr2.length && k < arr3.length) {
    if (compare(arr2[j], arr3[k])) {
      mergedArray.push(arr2[j]);
      j++;
    } else {
      mergedArray.push(arr3[k]);
      k++;
    }
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Add any remaining elements from arr1
  while (i < arr1.length) {
    mergedArray.push(arr1[i]);
    i++;
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Add any remaining elements from arr2
  while (j < arr2.length) {
    mergedArray.push(arr2[j]);
    j++;
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  // Add any remaining elements from arr3
  while (k < arr3.length) {
    mergedArray.push(arr3[k]);
    k++;
    if (maxItems != null && mergedArray.length >= maxItems) {
      return mergedArray;
    }
  }

  return mergedArray;
}
