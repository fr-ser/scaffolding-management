<script setup lang="ts">
import { computed } from "vue";

import { formatIsoDateString, formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import type { OverdueNoticeDocument } from "@/global/types/entities";

const props = defineProps<{
  document: OverdueNoticeDocument;
}>();

const invoiceTotals = computed(() => {
  const result = {} as Record<string, { net: number; vat: number; gross: number }>;

  for (const invoice of props.document.invoice_documents) {
    const net = getItemSum(invoice.items);
    const vatRate = getVatRate({ isoDate: invoice.service_dates[0] });

    result[invoice.id] = { net, vat: net * vatRate, gross: net * (1 + vatRate) };
  }

  return result;
});
</script>

<template>
  <table class="w-full item-table">
    <thead>
      <tr>
        <th>Rechnungsnummer</th>
        <th>Rechnungsdatum</th>
        <th>Fälligkeitsdatum</th>
        <th>Netto</th>
        <th>USt.</th>
        <th>Gesamt</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in document.invoice_documents" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ formatIsoDateString(item.creation_date) }}</td>
        <td>{{ formatIsoDateString(item.payment_target) }}</td>
        <td>{{ formatNumber(invoiceTotals[item.id].net, { currency: true }) }}</td>
        <td>
          {{
            formatNumber(invoiceTotals[item.id].vat, {
              currency: true,
            })
          }}
        </td>
        <td>
          {{ formatNumber(invoiceTotals[item.id].gross, { currency: true }) }}
        </td>
      </tr>
    </tbody>
  </table>

  <section class="mt-8">
    <div v-if="document.notice_costs">
      Zzgl. Mahnkosten in Höhe von: {{ formatNumber(document.notice_costs, { currency: true }) }}
    </div>
    <div v-if="document.default_interest">
      Zzgl. Verzugszinsen in Höhe von:
      {{ formatNumber(document.default_interest, { currency: true }) }}
    </div>
  </section>

  <table class="w-full mt-5 sum-table">
    <tbody>
      <tr class="font-bold">
        <td>Netto</td>
        <td>Umsatzsteuer</td>
        <td>Rechnungsbetrag</td>
      </tr>
      <tr>
        <td>
          {{
            formatNumber(
              Object.values(invoiceTotals).reduce((acc, curr) => acc + curr.net, 0),
              { currency: true },
            )
          }}
        </td>
        <td>
          {{
            formatNumber(
              Object.values(invoiceTotals).reduce((acc, curr) => acc + curr.vat, 0),
              { currency: true },
            )
          }}
        </td>
        <td>
          {{
            formatNumber(
              Object.values(invoiceTotals).reduce(
                (acc, curr) => acc + curr.gross,
                (document.default_interest || 0) + (document.notice_costs || 0),
              ),
              { currency: true },
            )
          }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss">
.item-table {
  th {
    border-bottom: 1px solid black;
  }

  td {
    border: 1px solid var(--document-table-border-color);
    text-align: center;
  }
}

.sum-table {
  td {
    border: 1px solid black;
    text-align: center;
  }
}
</style>
