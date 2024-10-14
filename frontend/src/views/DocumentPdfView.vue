<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import { getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { calculateItemSumPrice, getGrossAmount, getNettAmount } from "@/helpers/utils";
import DocumentPdfFooter from "@/views/DocumentPdfFooter.vue";
import DocumentPdfTable from "@/views/DocumentPdfTable.vue";
import DocumentTextPdf from "@/views/DocumentTextPdf.vue";
import DocumentTitlePdf from "@/views/DocumentTitlePdf.vue";

const route = useRoute();
let result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
// const pageId = route.query.sub_id;
const kind = route.query.sub_type as unknown as DocumentKind;

async function getDocument() {
  if (kind === DocumentKind.offer) {
    result.value = await getOfferDocument(route.params.id as string);
    console.log(result);
    return result;
  }
  if (kind === DocumentKind.invoice) {
    result.value = await getInvoiceDocument(route.params.id as string);
    console.log(result);
    return result;
  }
  if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(route.params.id as string);
    console.log(result);
    return result;
  } else {
    console.log("wrong type");
  }
}
// const allItemsSum = computed(() => {
//   if (kind === DocumentKind.offer) {
//     return calculateItemSumPrice(
//       (result.value as OfferDocument).items,
//       (result.value as OfferDocument).offered_at,
//     );
//   }
//   if (kind === DocumentKind.invoice) {
//     return calculateItemSumPrice((result.value as InvoiceDocument).items);
//   }
// });

// let filteredItems = computed(() => {
//   if (!(kind === DocumentKind.overdueNotice) && result.value) {
//     return (result.value as OfferDocument | InvoiceDocument).items.filter(function (item) {
//       return item.kind === ArticleKind.item;
//     });
//   } else {
//     return [];
//   }
// });
onMounted(async () => {
  await getDocument();
});
</script>
<template>
  <div class="w-full">
    <div
      v-if="result"
      class="min-h-297 w-[60rem] px-[4rem] ml-auto mr-auto py-5 border-solid border-2 border-slate-500 box-border"
    >
      <DocumentTitlePdf :result="result" :kind="kind" />
      <DocumentPdfTable :result="result" :kind="kind"></DocumentPdfTable>
      <!-- <table class="border-solid border-1 border-black">
        <thead>
          <tr>
            <th class="pl-6">Bezeihnung</th>
            <th class="pl-6">Anzeihl</th>
            <th class="pl-6">Anheit</th>
            <th class="pl-6">Preis</th>
            <th class="pl-6">Netto</th>
            <th class="pl-6">USt.%</th>
            <th class="pl-6">USt.</th>
            <th class="">Gesamt</th>
          </tr>
        </thead> -->
      <!-- <tbody
          v-if="!(kind === DocumentKind.overdueNotice)"
          class="border-solid border-1 border-black"
        >
          <tr
            v-for="item in filteredItems"
            :key="item.id"
            class="border-solid border-1 border-black"
          >
            <td>{{ item.description }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ `${item.price} €` }}</td>
            <td>{{ `${getNettAmount(item.amount, item.price)} €` }}</td>
            <td> -->
      <!-- TODO: MISSING INVOICEDATE -->
      <!-- {{
                `${
                  getVatRate({
                    isoDate: `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
                  }) *
                    100 +
                  " %"
                }`
              }}
            </td>
            <td>
              {{
                `${(
                  ((getNettAmount(item.amount, item.price) as number) *
                    getVatRate({
                      isoDate: `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
                    })) as number
                ).toFixed(2)} €`
              }}
            </td>
            <td>
            (item as InvoiceDocumentItem).invoiceDate -->
      <!-- {{
                getGrossAmount(
                  item,
                  `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
                )
              }}
            </td>
          </tr>
        </tbody>
      </table> -->
      <!-- <table v-if="!(kind === DocumentKind.overdueNotice)" class="mt-5">
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
      </table> -->
      <!-- <div v-if="kind === DocumentKind.overdueNotice">
        <section>
          <p class="font-bold">
            Zzgl. Mahnkosten in Höhe von:
            {{ `${(result as OverdueNoticeDocument).notice_costs} €` }}
          </p>
          <p class="font-bold">
            Zzgl. Verzugszinsen in Höhe von:
            {{ `${(result as OverdueNoticeDocument).default_interest} €` }}
          </p>
        </section> -->
      <!-- <table class="mt-5">
          <tbody>
            <tr class="font-bold">
              <td>Netto:</td>
              <td>Umsatzsteuer</td>
              <td>Rechnungsbetrag</td>
            </tr>
            <tr class="font-bold">
              <td>0,00 €</td>
              <td>0,00 €</td>
              <td>
                {{
                  `${(result as OverdueNoticeDocument).notice_costs + (result as OverdueNoticeDocument).default_interest} €`
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div> -->
      <DocumentTextPdf :result="result" :kind="kind"></DocumentTextPdf>
      <DocumentPdfFooter></DocumentPdfFooter>
    </div>
  </div>
</template>
<style>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}
</style>
