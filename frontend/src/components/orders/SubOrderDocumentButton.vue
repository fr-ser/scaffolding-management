<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";

import { getDocumentsBySubOrder } from "@/backendClient";
import { DocumentKind } from "@/global/types/appTypes";
import {
  type InvoiceDocument,
  type OfferDocument,
  type OverdueNoticeDocument,
} from "@/global/types/entities";

const props = defineProps<{
  id: number;
  kind: DocumentKind;
}>();

let visible = ref(false);
let documents = ref<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]>([]);
let isLoading = ref<boolean>(false);

async function getDocuments() {
  isLoading.value = true;
  documents.value = await getDocumentsBySubOrder(props.id, props.kind);
  isLoading.value = false;
}
async function openDocumentsList() {
  visible.value = true;
  getDocuments();
}
</script>
<template>
  <Button
    @click="openDocumentsList"
    label="Show all SubItem Documents"
    severity="secondary"
    outlined
    size="small"
  />
  <Dialog class="w-full sm:w-4/6" v-model:visible="visible" modal header="Auftragsdokumente">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    {{ documents.length === 0 ? "No documents" : null }}
    <div v-for="document in documents" :key="document.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">
        {{ documents.length === 0 ? "No documents" : document.id }}
      </div>
    </div>
  </Dialog>
</template>
