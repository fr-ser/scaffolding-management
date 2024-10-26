<script setup lang="ts">
import { formatIsoDateString } from "@/global/helpers";
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
  title.data = "Angebotsdatum";
  title.number = "Angebotsnummer";
}
if (props.kind === DocumentKind.invoice) {
  title.data = "Rechnungsdatum";
  title.number = "Rechnungsnummer";
}
if (props.kind === DocumentKind.overdueNotice) {
  title.data = "Mahndatum";
  title.number = "Belegnummer";
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
      <img class="h-32" src="http://redacted:5000/img/logo.png" />
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
      <p>Kundennummer: {{ result.client_id }}</p>
      <p>{{ `${title.number}: ` }} {{ result.id }}</p>
      <p v-if="props.kind === DocumentKind.offer">Angebot gültig bis:</p>
      <hr class="border-black border-1 mt-3" />
    </div>
  </section>
  <section v-if="props.kind === DocumentKind.invoice" class="mb-10 mt-[4rem]">
    <p class="font-bold">BV: {{ result.order_title }}</p>
    <p>
      Sehr geehrte Damen und Herren,<br />
      vielen Dank für Ihren Auftrag, den wir wie folgt in Rechnung stellen.
    </p>
  </section>
  <section v-if="props.kind === DocumentKind.offer" class="mb-10 mt-[4rem]">
    <p class="font-bold">BV:{{ result.client_id }} BV {{ result.client_last_name }}</p>
    <p>
      Sehr geehrte Damen und Herren,<br />
      vielen Dank für Ihr Interesse. Hiermit unterbreiten wir Ihnen folgendes Angebot
    </p>
  </section>
  <section v-if="props.kind === DocumentKind.overdueNotice" class="mb-10 mt-[4rem]">
    <p class="font-bold">BV:{{ result.client_id }} BV {{ result.client_last_name }}</p>
    <p>
      Sehr geehrte Damen und Herren,<br />
      auf unsere u.a. Rechnung(en) haben wir noch keinen Zahlungseingang feststellen können.<br />
      Wir bitten Sie, die Regulierung nachzuholen und sehen dem Eingang Ihrer Zahlung entgegen.<br />
      Sollten Sie zwischenzeitlich die Zahlung bereits geleistet haben, betrachten Sie dieses
      Schreiben bitte als gegenstandslos.<br />
      Es wurden ihre Zahlungen bis zum
      {{ `${formatIsoDateString((result as OverdueNoticeDocument).notice_date)}` }}
      berücksichtigt.<br />
      Bitte zahlen Sie bis spätestens:
      {{ `${formatIsoDateString((result as OverdueNoticeDocument).payments_until)}` }}
    </p>
  </section>
</template>
