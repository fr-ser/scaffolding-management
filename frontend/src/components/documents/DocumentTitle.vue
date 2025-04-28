<script setup lang="ts">
import { computed } from "vue";

import { formatIsoDateString, neverFunction } from "@/global/helpers";
import { DocumentKind, OverdueNoticeLevel } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
const VITE_COMPANY_STREET_AND_NUMBER = import.meta.env.VITE_COMPANY_STREET_AND_NUMBER;
const VITE_COMPANY_POSTAL_CODE_AND_CITY = import.meta.env.VITE_COMPANY_POSTAL_CODE_AND_CITY;
const BASE_URL = import.meta.env.BASE_URL;

const props = defineProps<{
  result: OfferDocument | OverdueNoticeDocument | InvoiceDocument;
  kind: DocumentKind;
}>();

const content = computed(() => {
  if (props.kind === DocumentKind.offer) {
    return {
      dateName: "Angebotsdatum",
      numberName: "Angebotsnummer",
      titleKind: "Angebot",
      date: (props.result as OfferDocument).offered_at,
    };
  } else if (props.kind === DocumentKind.invoice) {
    return {
      dateName: "Rechnungsdatum",
      numberName: "Rechnungsnummer",
      titleKind: "Rechnung",
      date: (props.result as InvoiceDocument).invoice_date,
    };
  } else if (props.kind === DocumentKind.overdueNotice) {
    let titleKind: string = (props.result as OverdueNoticeDocument).notice_level;
    if ((props.result as OverdueNoticeDocument).notice_level === OverdueNoticeLevel.last) {
      titleKind = "Letzte Mahnung vor Abgabe an Inkasso";
    }
    return {
      dateName: "Mahndatum",
      numberName: "Belegnummer",
      titleKind,
      date: (props.result as OverdueNoticeDocument).notice_date,
    };
  } else return neverFunction(props.kind);
});
</script>

<template>
  <header class="flex flex-row justify-between mb-10">
    <div class="text-xs">
      <p>{{ VITE_COMPANY_NAME }}</p>
      <p>{{ VITE_COMPANY_STREET_AND_NUMBER }}, {{ VITE_COMPANY_POSTAL_CODE_AND_CITY }}</p>
      <p class="font-bold text-2xl pt-5">{{ content.titleKind }}</p>
    </div>
    <div>
      <img class="h-32 mr-12" :src="`${BASE_URL}logo_pdf.png`" />
    </div>
  </header>
  <section class="flex flex-row justify-between">
    <div>
      <p class="font-bold">Empfänger:</p>
      <p class="font-bold">
        {{ result.client_company_name || result.client_first_name + " " + result.client_last_name }}
      </p>
      <p>{{ result.client_street_and_number }}</p>
      <p>{{ result.client_postal_code }} {{ result.client_city }}</p>
    </div>
    <div class="">
      <hr class="border-black border-1 mb-3" />
      <table class="header-info">
        <tbody>
          <tr>
            <td>{{ `${content.dateName}: ` }}</td>
            <td>{{ formatIsoDateString(content.date) }}</td>
          </tr>
          <tr>
            <td>Kundennummer:</td>
            <td>{{ result.client_id }}</td>
          </tr>
          <tr>
            <td>{{ `${content.numberName}: ` }}</td>
            <td>{{ result.id }}</td>
          </tr>
          <tr v-if="props.kind === DocumentKind.offer">
            <td>Angebot gültig bis:</td>
            <td>{{ formatIsoDateString((result as OfferDocument).offer_valid_until) }}</td>
          </tr>
        </tbody>
      </table>
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
    <p class="font-bold">BV:{{ result.order_title }}</p>
    <p>
      Sehr geehrte Damen und Herren,<br />
      vielen Dank für Ihr Interesse. Hiermit unterbreiten wir Ihnen folgendes Angebot
    </p>
  </section>
  <section v-if="props.kind === DocumentKind.overdueNotice" class="mb-10 mt-[4rem]">
    <p class="font-bold">BV:{{ result.order_title }}</p>
    <p>
      Sehr geehrte Damen und Herren,<br />
      auf unsere u.a. Rechnung(en) haben wir noch keinen Zahlungseingang feststellen können.<br />
      Wir bitten Sie, die Regulierung nachzuholen und sehen dem Eingang Ihrer Zahlung entgegen.<br />
      Sollten Sie zwischenzeitlich die Zahlung bereits geleistet haben, betrachten Sie dieses
      Schreiben bitte als gegenstandslos.<br />
      Es wurden ihre Zahlungen bis zum
      {{ `${formatIsoDateString((result as OverdueNoticeDocument).payments_until)}` }}
      berücksichtigt.<br /><br />
      Bitte zahlen Sie bis spätestens:
      <span class="font-bold">
        {{ `${formatIsoDateString((result as OverdueNoticeDocument).payment_target)}` }}
      </span>
    </p>
  </section>
</template>

<style scoped lang="scss">
.header-info {
  tr {
    line-height: 1.1em;
  }

  td:last-child {
    padding-left: 30px;
    width: 150px;
    text-align: center;
  }
}
</style>
