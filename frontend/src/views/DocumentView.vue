<script setup lang="ts">
import { saveAs } from "file-saver";
import Button from "primevue/button";
import { onMounted, ref } from "vue";

import { getDocumentPdf, getDocuments } from "@/backendClient";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const documents = ref([] as (OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]);

async function handleClick(doc: OfferDocument | OverdueNoticeDocument | InvoiceDocument) {
  let kind: DocumentKind;

  if ("offer_id" in doc) kind = DocumentKind.offer;
  else if ("overdue_notice_id" in doc) kind = DocumentKind.overdueNotice;
  else kind = DocumentKind.invoice;

  const response = await getDocumentPdf([{ kind, id: doc.id }]);
  saveAs(response, `${kind}-${doc.id}.pdf`);
}

onMounted(async () => {
  documents.value = await getDocuments();
});
</script>

<template>
  Offers:
  <ul v-if="documents">
    <li v-for="doc in documents" :key="doc.id">
      {{ doc }}<Button @click="handleClick(doc)" :label="`Download - ${doc.id}`" />
    </li>
  </ul>
</template>
