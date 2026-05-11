<script setup lang="ts">
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  CreditNoteDocument,
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const props = defineProps<{
  result: OfferDocument | OverdueNoticeDocument | InvoiceDocument | CreditNoteDocument;
  kind: DocumentKind;
}>();

const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
</script>

<template>
  <div class="pt-24 pb-2">
    <section v-if="props.kind === DocumentKind.offer">
      Die oben zusammengefassten Angaben sind nur geschätzte Angaben und werden bei
      Rechnungsstellung genau ermittelt und abgerechnet.<br /><br />
      Zahlung ohne Abzug innerhalb 14 Werktagen nach Rechnungserhalt bei uns eingehend.<br /><br />
      Dem Leistungsverzeichnis liegen zugrunde:
      <ul>
        <li class="list-disc ml-8">
          Die VOB (Verdingungsordung für Bauleistungen) Teil A und B, sowie Teil C - Allgemeine
          Technische Vertragsbedingungen für Bauleistungen (ATV) Gerüstbauarbeiten - DIN 18 451
        </li>
        <li class="list-disc ml-8">Die TRBS 2121-1</li>
        <li class="list-disc ml-8">
          Die Unfallverhütungs-Vorschriften der Bau-Berufsgenossenschaften
        </li>
        <li class="list-disc ml-8">Die Montage- Aufbauanleitungen der Gerüsthersteller</li>
      </ul>
      <br />
      Wir weisen auf die Nutzungshinweise bzw. Verwendungsbeschränkungen hin. Diese gelten nach
      Auftragserteilung als anerkannt.<br /><br />
      <span class="font-bold"> Stundenverrechnungssätze: </span>
      <ul>
        <li class="list-disc ml-8">Kolonnenführer 65,00 €/Stunde</li>
        <li class="list-disc ml-8">Gerüstbauer 60,00 €/Stunde</li>
        <li class="list-disc ml-8">Gerüstwerker 55,00 €/Stunde</li>
      </ul>
      <br />
      An- und Abfahrt unserer Montagekolonne, bestehend aus 2 Mann incl. LKW für den Material- bzw.
      Personentransport, für Gerüstumbauarbeiten oder Teilauf- bzw. Teilabbauten Pauschal 225,00
      €/Stück. Wie vor, jedoch 3 Mann = 285,00 €/Stück.<br /><br />
      Eine fach- und termingerechte Ausführung sichern wir Ihnen zu und würden uns über eine
      Auftragserteilung freuen.<br /><br />
      Mit freundlichen Grüßen<br /><br />
      {{ VITE_COMPANY_NAME }}<br /><br />
      <div class="flex">
        <span>
          Zur Auftragserteilung und Bestätigung senden Sie uns das Angebot bitte unterschrieben
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
      <div class="relative">
        Die aufgeführten Arbeiten wurden am
        {{ (result as InvoiceDocument).service_dates.map(formatIsoDateString).join(", ") }}
        ausgeführt.<br />
        Zahlungsziel: Bitte zahlen Sie bis zum
        {{ formatIsoDateString((result as InvoiceDocument).payment_target) }} ohne Abzug.<br /><br />
        <div class="absolute right-0 top-0 flex flex-col items-center">
          <span class="text-[10px] text-slate-500 mb-1">Überweisung per QR-Code</span>
          <div
            class="border-2 border-dashed border-slate-400 w-24 h-24 flex items-center justify-center text-center text-[10px] text-slate-400 p-2"
          >
            (nur im PDF)
          </div>
        </div>
      </div>
      Mit freundlichen Grüßen <br /><br />
      {{ VITE_COMPANY_NAME }}
    </section>

    <section v-if="props.kind === DocumentKind.overdueNotice" class="relative">
      Überweisen Sie bitte den offenen Betrag auf das unten aufgeführte Geschäftskonto. <br /><br />
      Mit freundlichen Grüßen <br /><br />
      {{ VITE_COMPANY_NAME }}
      <div class="absolute right-0 top-0 flex flex-col items-center">
        <span class="text-[10px] text-slate-500 mb-1">Überweisung per QR-Code</span>
        <div
          class="border-2 border-dashed border-slate-400 w-24 h-24 flex items-center justify-center text-center text-[10px] text-slate-400 p-2"
        >
          (nur im PDF)
        </div>
      </div>
    </section>

    <section v-if="props.kind === DocumentKind.creditNote">
      Der gutgeschriebene Betrag wird mit Ihrer nächsten Rechnung verrechnet oder auf Wunsch
      erstattet.<br /><br />
      Mit freundlichen Grüßen <br /><br />
      {{ VITE_COMPANY_NAME }}
    </section>
  </div>
</template>
