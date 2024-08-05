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

// const route = useRoute();
let visible = ref(false);
// let search = ref("");
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
    <!-- <div class="card flex w-full gap-x-6 mb-3"> -->
    <!-- <span class="relative grow bg-zinc-100">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        /> -->
    <!-- <InputText v-model="search" placeholder="Suche" class="pl-10 w-full" /> -->
    <!-- </span> -->
    <!-- </div> -->
    <div v-for="document in documents" :key="document.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </div>
  </Dialog>
</template>
