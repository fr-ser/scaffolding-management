<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

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

async function getDocuments() {
  documents.value = await getDocumentsByOrder(props.id as string);
}
async function openDocumentsList() {
  visible.value = true;
  getDocuments();
}
</script>

<template>
  <div class="font-bold my-2">Dokumente</div>
  <div>
    <Button
      @click="openDocumentsList"
      label="Alle Auftragsdokumente anzeigen"
      severity="secondary"
      outlined
      size="small"
    />
  </div>
  <Dialog v-model:visible="visible" modal header="Auftragsdokumente" :style="{ width: '25rem' }">
    <div v-for="document in documents" :key="document.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </div>
  </Dialog>
</template>
