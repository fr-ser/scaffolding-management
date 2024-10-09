<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import { ArticleKind, DocumentKind } from "@/global/types/appTypes";
import type { OverdueNoticeDocument } from "@/global/types/entities";
import DocumentTitlePdf from "@/views/DocumentTitlePdf.vue";

const route = useRoute();
let result = ref<OverdueNoticeDocument>();
const kind = route.query.sub_type as unknown as DocumentKind;
async function getDocument() {
  if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(route.params.id as string);
    console.log(result);
    return result;
  } else {
    console.log("wrong type");
  }
}

onMounted(async () => {
  getDocument();
});
</script>
<template>
  <div v-if="result">
    <DocumentTitlePdf :result="result" :kind="kind" />
    <section class="mb-10 mt-[4rem]">
      <p class="font-bold">BV:{{ result.client_id }} BV {{ result.client_last_name }}</p>
      <p>
        Sehr geehrte Damen und Herren,<br />
        auf unsere u.a. Rechnung(en) haben wir noch keinen Zahlungseingang feststellen können.<br />
        Wir bitten Sie, die Regulierung nachzuholen und sehen dem Eingang Ihrer Zahlung entgegen.<br />
        Sollten Sie zwischenzeitlich die Zahlung bereits geleistet haben, betrachten Sie dieses
        Schreiben bitte als gegenstandslos.<br />
        Es wurden ihre Zahlungen bis zum {{ `${result.notice_date}` }}10.1.2021 berücksichtigt.<br />
        Bitte zahlen Sie bis spätestens: {{ `${result.payments_until}` }}
      </p>
    </section>
    <table>
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
    </table>
    <section>
      <p>Zzgl. Mahnkosten in Höhe von: {{ `${result.notice_costs} €` }}</p>
      <p>Zzgl. Verzugszinsen in Höhe von: {{ `${result.default_interest} €` }}</p>
    </section>
    <table class="mt-5">
      <tbody>
        <tr class="font-bold">
          <td>Netto:</td>
          <td>Umsatzsteuer</td>
          <td>Rechnungsbetrag</td>
        </tr>
        <tr class="font-bold">
          <td></td>
          <td></td>
          <td>{{ `${result.notice_costs + result.default_interest} €` }}</td>
        </tr>
      </tbody>
    </table>
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
