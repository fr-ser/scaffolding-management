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
</script>
<template>
  <section v-if="props.kind === DocumentKind.offer">
    Die oben zusammengefassten Angaben sind nur geschätzte Angaben und werden bei Rechnungsstellung
    genau<br />
    ermittelt und abgerechnet.<br />
    Wir hoffen Ihnen sagt unser Angebot zu und würden uns freuen, Ihren Auftrag zu erhalten!<br />
    Mit freundlichen Grüßen<br />
    John Smith<br />
    Zur Auftragsersteilung und Bestätigung senden Sie uns das Angebot bitte<br />
    unterschrieben zurück:
  </section>
  <section v-if="props.kind === DocumentKind.invoice">
    Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto.<br />
    Sie sind verpflichtet, die Rechnung zu Steuerzwecken zwei Jahre lang aufzubewahren.<br />
    Die aufgeführten Arbeiten wurden am
    {{ (result as InvoiceDocument).service_dates.map(formatIsoDateString).join(", ") }}
    ausgeführt.<br />
    Zahlungsziel: Bitte zahlen Sie bis zum
    {{ formatIsoDateString((result as InvoiceDocument).payment_target) }} ohne Abzug.<br />
    Mit freundlichen Grüßen <br />
    John Smith
  </section>
  <section v-if="props.kind === DocumentKind.overdueNotice">
    Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto. <br />
    Mit freundlichen Grüßen <br />
    John Smith <br />
  </section>
</template>
