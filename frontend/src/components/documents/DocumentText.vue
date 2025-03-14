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

const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
</script>

<template>
  <div class="pt-24 pb-2">
    <section v-if="props.kind === DocumentKind.offer">
      Die oben zusammengefassten Angaben sind nur geschätzte Angaben und werden bei
      Rechnungsstellung genau<br />
      ermittelt und abgerechnet.<br />
      Wir hoffen Ihnen sagt unser Angebot zu und würden uns freuen, Ihren Auftrag zu erhalten!<br /><br />
      Mit freundlichen Grüßen<br /><br />
      {{ VITE_COMPANY_NAME }}<br /><br />
      <div class="flex">
        <span>
          Zur Auftragsersteilung und Bestätigung senden Sie uns das Angebot bitte unterschrieben
          zurück:
        </span>
        <span class="border-solid border-t border-black whitespace-nowrap pr-8 mr-7"
          >Datum und Unterschrift</span
        >
      </div>
    </section>

    <section v-if="props.kind === DocumentKind.invoice">
      Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto.<br />
      Sie sind verpflichtet, die Rechnung zu Steuerzwecken zwei Jahre lang aufzubewahren.<br /><br />
      Die aufgeführten Arbeiten wurden am
      {{ (result as InvoiceDocument).service_dates.map(formatIsoDateString).join(", ") }}
      ausgeführt.<br />
      Zahlungsziel: Bitte zahlen Sie bis zum
      {{ formatIsoDateString((result as InvoiceDocument).payment_target) }} ohne Abzug.<br /><br />
      Mit freundlichen Grüßen <br /><br />
      {{ VITE_COMPANY_NAME }}
    </section>

    <section v-if="props.kind === DocumentKind.overdueNotice">
      Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto. <br /><br />
      Mit freundlichen Grüßen <br /><br />
      {{ VITE_COMPANY_NAME }}
    </section>
  </div>
</template>
