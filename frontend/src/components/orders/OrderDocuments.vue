<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";

import { getDocumentsByOrder } from "@/backendClient";
import {
  type InvoiceDocument,
  type OfferDocument,
  type OverdueNoticeDocument,
} from "@/global/types/entities";

const props = defineProps<{
  id: string;
}>();

let visible = ref(false);
let documents = ref<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]>([]);
let isLoading = ref<boolean>(false);

async function getDocuments() {
  isLoading.value = true;
  documents.value = await getDocumentsByOrder(props.id as string);
  isLoading.value = false;
}
async function openDocumentsList() {
  visible.value = true;
  getDocuments();
}
</script>

<template>
  <div class="font-bold my-2">Dokumente</div>
  <div class="flex flex-row gap-4">
    <Button
      @click="openDocumentsList"
      label="Alle Auftragsdokumente anzeigen"
      severity="secondary"
      outlined
      size="small"
    />
    <!-- <Button label="Dokument Erstellen" outlined size="small" /> -->
  </div>
  <Dialog class="w-full sm:w-4/6" v-model:visible="visible" modal header="Auftragsdokumente">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else v-for="document in documents" :key="document.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </div>
  </Dialog>
</template>
