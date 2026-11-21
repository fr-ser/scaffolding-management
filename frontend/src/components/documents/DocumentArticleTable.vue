<script setup lang="ts">
import { computed } from "vue";

import {
  formatNumber,
  getItemSum,
  getVatAmount,
  getVatRate,
  maybeMultiply,
  neverFunction,
} from "@/global/helpers";
import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import type { CreditNoteDocument, InvoiceDocument, OfferDocument } from "@/global/types/entities";
import { getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  document: OfferDocument | InvoiceDocument | CreditNoteDocument;
  kind: DocumentKind.invoice | DocumentKind.offer | DocumentKind.creditNote;
}>();

const vatDate = computed(() => {
  let vatDate: string;

  if (props.kind === DocumentKind.invoice) {
    vatDate = (props.document as InvoiceDocument).service_dates[0];
  } else if (props.kind === DocumentKind.offer) {
    vatDate = (props.document as OfferDocument).offered_at;
  } else if (props.kind === DocumentKind.creditNote) {
    vatDate = (props.document as CreditNoteDocument).credit_date;
  } else neverFunction(props.kind);

  return vatDate;
});

const vatRate = computed(() => getVatRate({ isoDate: vatDate.value }));

const allItemsNetSum = computed(() => {
  return getItemSum(props.document.items);
});
</script>

<template>
  <table class="w-full item-table">
    <thead>
      <tr>
        <th style="width: 280px">Bezeichnung</th>
        <th style="width: 50px">Anzahl</th>
        <th style="width: 50px">Einheit</th>
        <th style="width: 50px">Preis</th>
        <th style="width: 50px">Netto</th>
        <th style="width: 40px">USt.%</th>
        <th style="width: 50px">USt.</th>
        <th style="width: 60px">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in document.items" :key="item.id">
        <td>
          <div class="font-bold">{{ item.title }}</div>
          {{ item.description }}
        </td>
        <td>{{ item.kind === ArticleKind.heading ? "" : formatNumber(item.amount) }}</td>
        <td>{{ item.kind === ArticleKind.heading ? "" : item.unit }}</td>
        <td>{{ item.kind === ArticleKind.heading ? "" : formatNumber(item.price) }}</td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : formatNumber(maybeMultiply(item.amount, item.price), { maxDecimals: 2 })
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : document.client_reverse_vat
                ? "-"
                : `${vatRate * 100} %`
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : document.client_reverse_vat
                ? "-"
                : formatNumber(getVatAmount(item.amount, item.price, vatDate), { maxDecimals: 2 })
          }}
        </td>
        <td>
          {{
            item.kind === ArticleKind.heading
              ? ""
              : document.client_reverse_vat
                ? "-"
                : formatNumber(getGrossAmount(item, vatDate), { maxDecimals: 2 })
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
        <td>Brutto</td>
      </tr>
      <tr class="font-bold">
        <td>{{ formatNumber(allItemsNetSum, { currency: true }) }}</td>
        <td>
          {{
            document.client_reverse_vat
              ? "-"
              : formatNumber(allItemsNetSum * vatRate, { currency: true })
          }}
        </td>
        <td>
          {{
            document.client_reverse_vat
              ? "-"
              : formatNumber(allItemsNetSum * (1 + vatRate), { currency: true })
          }}
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="kind === DocumentKind.invoice && document.client_reverse_vat" class="mt-3">
    <p>Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)</p>
    <p>
      Die Rechnung enthält keine Umsatzsteuer, da die Steuerschuldnerschaft auf den
      Leistungsempfänger übergeht.
    </p>
  </div>
</template>

<style scoped>
.item-table {
  th {
    border-bottom: 1px solid black;
  }

  td {
    border: 1px solid var(--document-table-border-color);
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
