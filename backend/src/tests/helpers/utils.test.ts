import { describe, expect, test } from "vitest";

import { OfferDocument } from "@/db/entities/documents";
import { mergeSortedDocuments } from "@/helpers/utils";

describe("mergeSortedDocuments", () => {
  test("sorting", async () => {
    const array1 = [
      { creation_date: "2024-07-01" },
      { creation_date: "2024-07-04" },
      { creation_date: "2024-07-07" },
    ] as OfferDocument[];
    const array2 = [
      { creation_date: "2024-07-02" },
      { creation_date: "2024-07-05" },
      { creation_date: "2024-07-08" },
    ] as OfferDocument[];
    const array3 = [
      { creation_date: "2024-07-03" },
      { creation_date: "2024-07-06" },
      { creation_date: "2024-07-09" },
    ] as OfferDocument[];

    const mergedArray = mergeSortedDocuments(array1, array2, array3, {
      isAscending: true,
      maxItems: 999,
    });

    expect(mergedArray).toEqual([
      { creation_date: "2024-07-01" },
      { creation_date: "2024-07-02" },
      { creation_date: "2024-07-03" },
      { creation_date: "2024-07-04" },
      { creation_date: "2024-07-05" },
      { creation_date: "2024-07-06" },
      { creation_date: "2024-07-07" },
      { creation_date: "2024-07-08" },
      { creation_date: "2024-07-09" },
    ]);
  });

  test("maxItems", async () => {
    const array1 = [{ creation_date: "2024-07-01" }] as OfferDocument[];
    const array2 = [{ creation_date: "2024-07-02" }] as OfferDocument[];
    const array3 = [{ creation_date: "2024-07-04" }] as OfferDocument[];

    const mergedArray = mergeSortedDocuments(array1, array2, array3, {
      isAscending: true,
      maxItems: 2,
    });

    expect(mergedArray).toEqual([{ creation_date: "2024-07-01" }, { creation_date: "2024-07-02" }]);
  });
});
