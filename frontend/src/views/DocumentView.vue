<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import {
  getInvoiceDocument,
  getOfferDocument,
  getOverdueNoticeDocument,
  sendDocumentAsEmail,
} from "@/backendClient";
import DocumentArticleTable from "@/components/documents/DocumentArticleTable.vue";
import DocumentFooter from "@/components/documents/DocumentFooter.vue";
import DocumentInvoiceItemTable from "@/components/documents/DocumentInvoiceItemTable.vue";
import DocumentText from "@/components/documents/DocumentText.vue";
import DocumentTitle from "@/components/documents/DocumentTitle.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { getDocumentListPath, getOrderEditPath } from "@/helpers/routes";

const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
const VITE_COMPANY_STREET_AND_NUMBER = import.meta.env.VITE_COMPANY_STREET_AND_NUMBER;
const VITE_COMPANY_POSTAL_CODE_AND_CITY = import.meta.env.VITE_COMPANY_POSTAL_CODE_AND_CITY;
const VITE_COMPANY_PHONE = import.meta.env.VITE_COMPANY_PHONE;
const VITE_COMPANY_MOBILE_PHONE = import.meta.env.VITE_COMPANY_MOBILE_PHONE;
const VITE_COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const VITE_COMPANY_HOMEPAGE = import.meta.env.VITE_COMPANY_HOMEPAGE;

const confirm = useConfirmations();
const notification = useNotifications();

const route = useRoute();
const kind = route.params.kind as DocumentKind;
let emailKind = "";

if (kind === DocumentKind.invoice) {
  emailKind = "die Rechnung";
} else if (kind === DocumentKind.offer) {
  emailKind = "das Angebot";
} else if (kind === DocumentKind.overdueNotice) {
  emailKind = "die Mahnung";
} else neverFunction(kind);

const result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
const isEmailDialogVisible = ref(false);

const emailRecipient = ref("");
const emailSubject = ref("");
const emailMessage = ref("");
const emailAttachmentName = ref("");

async function getDocument() {
  if (kind === DocumentKind.offer) {
    result.value = await getOfferDocument(route.params.id as string);
    return result;
  } else if (kind === DocumentKind.invoice) {
    result.value = await getInvoiceDocument(route.params.id as string);
    return result;
  } else if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(route.params.id as string);
    return result;
  } else neverFunction(kind);
}

function sendClick() {
  confirm.showConfirmation("Möchten Sie die E-Mail senden?", async function () {
    try {
      await sendDocumentAsEmail({
        kind,
        id: route.params.id as string,
        recipient: emailRecipient.value,
        message: emailMessage.value,
        subject: emailSubject.value,
        attachmentName: emailAttachmentName.value,
      });
    } catch (error) {
      notification.showNotification(
        "Die E-Mail wurde nicht versandt. Es gab ein technisches Problem.",
        "error",
      );
      return;
    }

    notification.showNotification("Die E-Mail wurde versandt.");
    isEmailDialogVisible.value = false;
  });
}

onMounted(async () => {
  await getDocument();
  if (result.value == null) return;
  emailRecipient.value = result.value.client_email || "";
  emailSubject.value = `${VITE_COMPANY_NAME} - ${kind} - ${result.value.id}`;
  emailAttachmentName.value = `${kind}_${result.value.id}.pdf`;
  emailMessage.value = `Sehr geehrte Damen und Herren,

anbei erhalten Sie ${emailKind} für Ihr BV: ${result.value.order_title}.

Mit freundlichen Grüßen

${VITE_COMPANY_NAME}

${VITE_COMPANY_STREET_AND_NUMBER}
${VITE_COMPANY_POSTAL_CODE_AND_CITY}

${VITE_COMPANY_EMAIL}
${VITE_COMPANY_HOMEPAGE}


Mobil: ${VITE_COMPANY_MOBILE_PHONE}
Tel.: ${VITE_COMPANY_PHONE}
`;
});
</script>

<template>
  <div class="">
    <div class="flex flex-row justify-between mb-2">
      <router-link :to="getDocumentListPath()">
        <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
      </router-link>
      <div class="flex gap-x-2">
        <router-link :to="getOrderEditPath(result?.order_id as string)">
          <Button label="Auftrag anzeigen" severity="info" text raised />
        </router-link>
        <Button
          label="E-Mail-Versand"
          severity="info"
          text
          raised
          @click="isEmailDialogVisible = true"
        />
      </div>
    </div>
    <div
      v-if="result"
      class="min-h-297 w-[60rem] px-[4rem] ml-auto mr-auto py-5 border-solid border-2 border-slate-500 box-border"
    >
      <DocumentTitle :result="result" :kind="kind" />
      <DocumentInvoiceItemTable
        v-if="kind === DocumentKind.overdueNotice"
        :document="result as OverdueNoticeDocument"
      />
      <DocumentArticleTable
        v-else
        :document="result as InvoiceDocument | OfferDocument"
        :kind="kind"
      />
      <DocumentText :result="result" :kind="kind" />
      <DocumentFooter />
    </div>

    <Dialog v-model:visible="isEmailDialogVisible" modal header="E-Mail:">
      <div class="flex flex-col gap-2">
        <label for="recipient">An:</label>
        <InputText id="recipient" v-model="emailRecipient" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="subject">Betreff:</label>
        <InputText id="subject" v-model="emailSubject" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="message">Nachricht:</label>
        <Textarea v-model="emailMessage" autoResize />
      </div>
      <div class="flex flex-col gap-2">
        <label for="attachment">Dateiname (Anhang):</label>
        <InputText id="attachment" v-model="emailAttachmentName" />
      </div>

      <div class="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          label="Abbrechen"
          severity="secondary"
          @click="isEmailDialogVisible = false"
        ></Button>
        <Button type="button" label="Senden" @click="sendClick"></Button>
      </div>
    </Dialog>
  </div>
</template>
