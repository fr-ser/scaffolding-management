<script setup lang="ts">
import { computed } from "vue";

import { getNetAmount, getVatAmount, getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { calculateItemSumPrice, getFormatedAmount, getGrossAmount } from "@/helpers/utils";

const allItemsSum = computed(() => {
  if (props.kind === DocumentKind.offer) {
    return calculateItemSumPrice(
      (props.result as OfferDocument).items,
      (props.result as OfferDocument).offered_at,
    );
  }
  if (props.kind === DocumentKind.invoice) {
    return calculateItemSumPrice((props.result as InvoiceDocument).items);
  } else {
    return undefined;
  }
});
let filteredItems = computed(() => {
  if (!(props.kind === DocumentKind.overdueNotice) && props.result) {
    return (props.result as OfferDocument | InvoiceDocument).items.filter(function (item) {
      return item.kind === ArticleKind.item;
    });
  } else {
    return [];
  }
});
const props = defineProps<{
  result: OfferDocument | OverdueNoticeDocument | InvoiceDocument;
  kind: DocumentKind;
}>();
</script>
<template>
  <table class="border-solid border-1 border-black">
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
    </thead>
    <tbody v-if="!(kind === DocumentKind.overdueNotice)" class="border-solid border-1 border-black">
      <tr v-for="item in filteredItems" :key="item.id" class="border-solid border-1 border-black">
        <td>{{ item.description }}</td>
        <td>{{ item.amount }}</td>
        <td>{{ item.unit }}</td>
        <td>{{ `${item.price || "-"} €` }}</td>
        <td>{{ `${getFormatedAmount(getNetAmount(item.amount, item.price))}` }}</td>
        <td>
          {{
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
            getFormatedAmount(
              getVatAmount(
                item.amount,
                item.price,
                `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
              ),
            )
          }}
        </td>
        <td>
          {{
            getFormatedAmount(
              getGrossAmount(
                item,
                `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
              ),
            )
          }}
        </td>
      </tr>
    </tbody>
  </table>
  <table v-if="!(kind === DocumentKind.overdueNotice)" class="mt-5">
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
  <div v-if="kind === DocumentKind.overdueNotice">
    <section>
      <p class="font-bold">
        Zzgl. Mahnkosten in Höhe von:
        {{ `${(result as OverdueNoticeDocument).notice_costs} €` }}
      </p>
      <p class="font-bold">
        Zzgl. Verzugszinsen in Höhe von:
        {{ `${(result as OverdueNoticeDocument).default_interest} €` }}
      </p>
    </section>
    <table class="mt-5">
      <tbody>
        <tr class="font-bold">
          <td>Netto</td>
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
  </div>
</template>
