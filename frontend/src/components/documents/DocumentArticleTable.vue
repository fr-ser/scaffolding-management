<script setup lang="ts">
import { computed } from "vue";

import {
  formatNumber,
  getNetAmount,
  getVatAmount,
  getVatRate,
  neverFunction,
} from "@/global/helpers";
import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import type { InvoiceDocument, OfferDocument } from "@/global/types/entities";
import { calculateItemSumPrice, getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  document: OfferDocument | InvoiceDocument;
  kind: DocumentKind.invoice | DocumentKind.offer;
}>();

const allItemsSum = computed(() => {
  let vatDate: string;

  if (props.kind === DocumentKind.invoice) {
    vatDate = (props.document as InvoiceDocument).service_dates[0];
  } else if (props.kind === DocumentKind.offer) {
    vatDate = (props.document as OfferDocument).offered_at;
  } else neverFunction(props.kind);

  return calculateItemSumPrice(props.document.items, vatDate);
});
</script>

<template>
  <table class="w-full item-table">
    <thead>
      <tr>
        <th>Bezeichnung</th>
        <th>Anzahl</th>
        <th>Einheit</th>
        <th>Preis</th>
        <th>Netto</th>
        <th>USt.%</th>
        <th>USt.</th>
        <th>Gesamt</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in document.items" :key="item.id">
        <td>
          <div class="font-bold">{{ item.title }}</div>
          {{ item.description }}
        </td>
        <td>{{ item.kind === ArticleKind.heading ? "" : item.amount }}</td>
        <td>{{ item.kind === ArticleKind.heading ? "" : item.unit }}</td>
        <td>{{ item.kind === ArticleKind.heading ? "" : item.price }}</td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : formatNumber(getNetAmount(item.amount, item.price), { decimals: 2 })
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : `${
                  getVatRate({
                    isoDate: `${kind === DocumentKind.invoice ? "" : (document as OfferDocument).offered_at}`,
                  }) *
                    100 +
                  " %"
                }`
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : formatNumber(
                  getVatAmount(
                    item.amount,
                    item.price,
                    `${kind === DocumentKind.invoice ? "" : (document as OfferDocument).offered_at}`,
                  ),
                  { decimals: 2 },
                )
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : formatNumber(
                  getGrossAmount(
                    item,
                    `${kind === DocumentKind.invoice ? "" : (document as OfferDocument).offered_at}`,
                  ),
                  { decimals: 2 },
                )
          }}
        </td>
      </tr>
    </tbody>
  </table>
  <table class="w-full mt-5 sum-table">
    <tbody>
      <tr class="font-bold">
        <td>Netto:</td>
        <td>Umsatzsteuer</td>
        <td>Rechnungsbetrag</td>
      </tr>
      <tr class="font-bold">
        <td>{{ allItemsSum?.amountNet }}</td>
        <td>{{ allItemsSum?.amountVat }}</td>
        <td>{{ allItemsSum?.amountGross }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.item-table {
  th {
    border-bottom: 1px solid black;
  }

  td {
    border: 1px solid rgba(96, 125, 139, 0.5);
    text-align: center;
  }
  td:first-child {
    text-align: left;
  }
}

.sum-table {
  td {
    border: 1px solid black;
    text-align: center;
  }
}
</style>
