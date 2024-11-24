import { describe, expect, test } from "vitest";

import { OfferDocument } from "@/db/entities/documents";
import { mergeSortedDocuments } from "@/helpers/utils";

describe("mergeSortedDocuments", () => {
  test("sorting", async () => {
    const array1 = [{ created_at: 1 }, { created_at: 4 }, { created_at: 7 }] as OfferDocument[];
    const array2 = [{ created_at: 2 }, { created_at: 5 }, { created_at: 8 }] as OfferDocument[];
    const array3 = [{ created_at: 3 }, { created_at: 6 }, { created_at: 9 }] as OfferDocument[];

    const mergedArray = mergeSortedDocuments(array1, array2, array3, {
      isAscending: true,
      maxItems: 999,
    });

    expect(mergedArray).toEqual([
      { created_at: 1 },
      { created_at: 2 },
      { created_at: 3 },
      { created_at: 4 },
      { created_at: 5 },
      { created_at: 6 },
      { created_at: 7 },
      { created_at: 8 },
      { created_at: 9 },
    ]);
  });

  test("maxItems", async () => {
    const array1 = [{ created_at: 1 }] as OfferDocument[];
    const array2 = [{ created_at: 2 }] as OfferDocument[];
    const array3 = [{ created_at: 4 }] as OfferDocument[];

    const mergedArray = mergeSortedDocuments(array1, array2, array3, {
      isAscending: true,
      maxItems: 2,
    });

    expect(mergedArray).toEqual([{ created_at: 1 }, { created_at: 2 }]);
  });
});
