<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import DocumentPdfFooter from "@/components/documents/DocumentPdfFooter.vue";
import DocumentPdfTable from "@/components/documents/DocumentPdfTable.vue";
import DocumentTextPdf from "@/components/documents/DocumentTextPdf.vue";
import DocumentTitlePdf from "@/components/documents/DocumentTitlePdf.vue";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const route = useRoute();
let result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
const kind = route.query.sub_type as unknown as DocumentKind;

async function getDocument() {
  if (kind === DocumentKind.offer) {
    result.value = await getOfferDocument(route.params.id as string);
    return result;
  }
  if (kind === DocumentKind.invoice) {
    result.value = await getInvoiceDocument(route.params.id as string);
    return result;
  }
  if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(route.params.id as string);
    return result;
  }
}
onMounted(async () => {
  await getDocument();
});
</script>
<template>
  <div class="w-full">
    <div
      v-if="result"
      class="min-h-297 w-[60rem] px-[4rem] ml-auto mr-auto py-5 border-solid border-2 border-slate-500 box-border"
    >
      <DocumentTitlePdf :result="result" :kind="kind" />
      <DocumentPdfTable :result="result" :kind="kind"></DocumentPdfTable>
      <DocumentTextPdf :result="result" :kind="kind"></DocumentTextPdf>
      <DocumentPdfFooter></DocumentPdfFooter>
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
