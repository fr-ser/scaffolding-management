<script setup lang="ts">
import { saveAs } from "file-saver";
import Button from "primevue/button";
import { onMounted, ref } from "vue";

import { getDocumentPdf, getDocuments } from "@/backendClient";
import { DocumentKind } from "@/global/types/appTypes";
import type { GetDocumentsResponse } from "@/global/types/backendTypes";

const documents = ref(null as null | GetDocumentsResponse);

async function handleClick(kind: DocumentKind, id: string) {
  const response = await getDocumentPdf([{ kind, id }]);
  saveAs(response, `${kind}-${id}.pdf`);
}

onMounted(async () => {
  documents.value = await getDocuments();
});
</script>

<template>
  Offers:
  <ul v-if="documents">
    <li v-for="offer in documents[DocumentKind.offer] || []" :key="offer.id">
      {{ offer
      }}<Button
        @click="handleClick(DocumentKind.offer, offer.id)"
        :label="`Download - ${offer.id}`"
      />
    </li>
  </ul>
</template>
