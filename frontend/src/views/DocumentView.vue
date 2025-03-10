<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import DocumentArticleTable from "@/components/documents/DocumentArticleTable.vue";
import DocumentFooter from "@/components/documents/DocumentFooter.vue";
import DocumentInvoiceItemTable from "@/components/documents/DocumentInvoiceItemTable.vue";
import DocumentText from "@/components/documents/DocumentText.vue";
import DocumentTitle from "@/components/documents/DocumentTitle.vue";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const route = useRoute();
let result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
const kind = route.params.kind as DocumentKind;

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
  </div>
</template>
