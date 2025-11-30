<script setup lang="ts">
import { saveAs } from "file-saver";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import {
  getDocumentPdf,
  getInvoiceDocument,
  getOfferDocument,
  getOverdueNoticeDocument,
} from "@/backendClient";
import DocumentArticleTable from "@/components/documents/DocumentArticleTable.vue";
import DocumentEmail from "@/components/documents/DocumentEmail.vue";
import DocumentFooter from "@/components/documents/DocumentFooter.vue";
import DocumentInvoiceItemTable from "@/components/documents/DocumentInvoiceItemTable.vue";
import DocumentText from "@/components/documents/DocumentText.vue";
import DocumentTitle from "@/components/documents/DocumentTitle.vue";
import useNotifications from "@/composables/useNotifications";
import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { getDocumentListPath, getOrderEditPath } from "@/helpers/routes";

const notification = useNotifications();

const route = useRoute();
const documentId = route.params.id as string;
const kind = route.params.kind as DocumentKind;

const result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
const isEmailDialogVisible = ref(false);

async function getDocument() {
  if (kind === DocumentKind.offer) {
    result.value = await getOfferDocument(documentId);
    return result;
  } else if (kind === DocumentKind.invoice) {
    result.value = await getInvoiceDocument(documentId);
    return result;
  } else if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(documentId);
    return result;
  } else neverFunction(kind);
}

async function onClickSavePdf() {
  const documentId = route.params.id as string;
  notification.showNotification("Ein PDF-Dokument wird erstellt...");
  const response = await getDocumentPdf([{ kind, id: documentId }]);

  saveAs(response, documentId + ".pdf");
}

onMounted(async () => {
  await getDocument();
});
</script>

<template>
  <div class="">
    <div class="flex flex-row justify-between mb-2">
      <router-link :to="getDocumentListPath()">
        <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
      </router-link>
      <div class="flex gap-x-2">
        <Button label="PDF speichern" severity="info" text raised @click="onClickSavePdf" />
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
    <DocumentEmail
      v-if="isEmailDialogVisible && result"
      :kind="kind"
      :document="result"
      @hide-dialog="isEmailDialogVisible = false"
    />
  </div>
</template>
