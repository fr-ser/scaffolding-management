<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import { getVatRate } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { calculateItemSumPrice, getGrossAmount, getNettAmount } from "@/helpers/utils";

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
const allItemsSum = computed(() => {
  if (kind === DocumentKind.offer) {
    return calculateItemSumPrice(
      (result.value as OfferDocument).items,
      (result.value as OfferDocument).offered_at,
    );
  }
  //   if (kind === DocumentKind.invoice)
  else {
    // TODO: missing invoice_date?
    return calculateItemSumPrice((result.value as InvoiceDocument).items);
  }
});

onMounted(async () => {
  getDocument();
});
</script>
<template>
  <div class="w-full">
    <div
      v-if="result"
      class="min-h-297 w-[60rem] px-[4rem] ml-auto mr-auto py-5 border-solid border-2 border-slate-500 box-border"
    >
      <header class="flex flex-row justify-between mb-10">
        <div class="text-xs">
          <p>redacted &amp; redacted</p>
          <p>redacted</p>
          <p class="font-bold text-2xl pt-5">{{ kind }}</p>
        </div>
        <div>
          <img class="h-32" src="http://redacted/img/logo.png" />
        </div>
      </header>
      <section class="flex flex-row justify-between">
        <div>
          <p class="font-bold">Empfänger:</p>
          <p class="font-bold">{{ result.client_company_name }}</p>
          <p>{{ result.client_street_and_number }}</p>
          <p>{{ result.client_postal_code }} {{ result.client_city }}</p>
        </div>
        <div class="">
          <hr class="border-black border-1 mb-3" />
          <p>Rechnungsdatum: {{ result.creation_date }}</p>
          <p>KundensNummer: {{ result.client_id }}</p>
          <p>Rechnungsnummer: {{ result.id }}</p>
          <hr class="border-black border-1 mt-3" />
        </div>
      </section>
      <section class="mb-10 mt-[4rem]">
        <p class="font-bold">BV:{{ result.client_id }} BV {{ result.client_last_name }}</p>
        <p>
          Sehr geehrte Damen und Herren,<br />
          vielen Dank für Ihren Auftrag, den wir wie folgt in Rechnung stellen.
        </p>
      </section>
      <table
        v-if="!(kind === DocumentKind.overdueNotice)"
        class="border-solid border-1 border-black"
      >
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
        <tbody class="border-solid border-1 border-black">
          <tr
            v-for="item in (result as OfferDocument | InvoiceDocument).items"
            :key="item.id"
            class="border-solid border-1 border-black"
          >
            <td>{{ item.description }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ `${item.price} €` }}</td>
            <td>{{ `${getNettAmount(item.amount, item.price)} €` }}</td>
            <td>
              <!-- TODO: MISSING INVOICEDATE -->
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
                `${(
                  ((getNettAmount(item.amount, item.price) as number) *
                    getVatRate({
                      isoDate: `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
                    })) as number
                ).toFixed(2)} €`
              }}
            </td>
            <td>
              <!-- (item as InvoiceDocumentItem).invoiceDate -->
              {{
                getGrossAmount(
                  item,
                  `${kind === DocumentKind.invoice ? "" : (result as OfferDocument).offered_at}`,
                )
              }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr></tr>
        </tfoot>
      </table>
      <table class="mt-5">
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
      <section>
        <p class="mt-5 leading-4">
          Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto.<br />
          Sie sind verpflichtet, die Rechnung zu Steuerzwecken zwei Jahre lang aufzubewahren.
        </p>
        <p class="mt-5 leading-4">
          Die aufgeführten Arbeiten wurden am 27.09.2024 ausgeführt.<br />
          Zahlungsziel: Bitte zahlen Sie bis zum 09.10.2024 ohne Abzug.
        </p>
        <p class="mt-5">Mit freundlichen Grüßen</p>
        <p class="mt-5">redacted</p>
      </section>
      <section class="text-xs">
        <hr class="border-black border-1 mb-3" />
        <div class="grid grid-cols-4 grid-rows-1 gap-1">
          <div>
            <p class="font-bold">redacted</p>
            <p>redacted</p>
            <p>redacted</p>
            <p>St-Nr: redacted</p>
            <p>USt-Id: redacted</p>
          </div>
          <div>
            <p class="font-bold">Kontaktinformation</p>
            <p>redacted</p>
            <p>Phone: redacted</p>
            <p>Mobil: redacted</p>
            <p>E-Mail: redacted</p>
          </div>
          <div class="col-span-2 flex flex-col gap-2">
            <p class="font-bold self-center">Bankverbindung</p>
            <div class="flex flex-row">
              <div>
                <p>Bankverbindung redacted</p>
                <p>IBAN: redacted</p>
                <p>BIC: redacted</p>
              </div>
              <div>
                <p>redacted</p>
                <p>IBAN: redacted</p>
                <p>BIC: redacted</p>
              </div>
            </div>
            <p class="self-center">Web: redacted</p>
          </div>
        </div>
      </section>
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
