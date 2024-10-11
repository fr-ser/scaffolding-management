<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const props = defineProps<{
  result: OfferDocument | OverdueNoticeDocument | InvoiceDocument;
  kind: DocumentKind;
}>();

let title = {
  data: "",
  number: "",
};

if (props.kind === DocumentKind.offer) {
  title.data = "AngebotsDatum";
  title.number = "AngebotsNummer";
}
if (props.kind === DocumentKind.invoice) {
  title.data = "RechnungDatum";
  title.number = "RechnungNummer";
}
if (props.kind === DocumentKind.overdueNotice) {
  title.data = "MahnDatum";
  title.number = "BelegNummer";
}
</script>
<template>
  <header class="flex flex-row justify-between mb-10">
    <div class="text-xs">
      <p>redacted &amp; redacted</p>
      <p>redacted</p>
      <p class="font-bold text-2xl pt-5">{{ kind }}</p>
    </div>
    <div>
      <img class="h-32" src="http://bergedorfer.diskstation.org:5000/img/logo.png" />
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
      <p>{{ `${title.data}: ` }} {{ result.creation_date }}</p>
      <p>KundensNummer: {{ result.client_id }}</p>
      <p>{{ `${title.number}: ` }} {{ result.id }}</p>
      <p v-if="props.kind === DocumentKind.offer">Angebot gültig bis:</p>
      <hr class="border-black border-1 mt-3" />
    </div>
  </section>
</template>
