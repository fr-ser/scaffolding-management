<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";

import { getDocumentsByOrder, getDocumentsBySubOrder } from "@/backendClient";
import { DocumentKind } from "@/global/types/appTypes";
import {
  type InvoiceDocument,
  type OfferDocument,
  type OverdueNoticeDocument,
} from "@/global/types/entities";

const props = defineProps<{
  id: string | number;
  kind?: DocumentKind;
}>();

let visible = ref(false);
let documents = ref<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]>([]);
let isLoading = ref<boolean>(false);

async function getAllDocuments() {
  isLoading.value = true;
  documents.value = await getDocumentsByOrder(props.id as string);
  isLoading.value = false;
}
async function openAllDocumentsList() {
  visible.value = true;
  getAllDocuments();
}
async function getItemDocuments() {
  isLoading.value = true;
  documents.value = await getDocumentsBySubOrder(props.id as number, props.kind as DocumentKind);
  isLoading.value = false;
}
async function openItemDocumentsList() {
  visible.value = true;
  getItemDocuments();
}
console.log(DocumentKind);
</script>

<template>
  <div v-if="!kind" class="font-bold my-2">Dokumente</div>
  <div class="flex flex-row gap-4">
    <Button
      v-if="!kind"
      @click="openAllDocumentsList"
      label="Alle Auftragsdokumente anzeigen"
      severity="secondary"
      outlined
      size="small"
    />
    <Button
      v-else
      @click="openItemDocumentsList"
      label="Show all SubItem Documents"
      severity="secondary"
      outlined
      size="small"
    />
  </div>
  <Dialog class="w-full sm:w-4/6" v-model:visible="visible" modal header="Auftragsdokumente">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    {{ documents.length === 0 ? "No documents" : null }}
    <div v-for="document in documents" :key="document.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </div>
  </Dialog>
</template>
