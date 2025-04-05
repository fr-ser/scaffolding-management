<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";

import { getDocumentsByOrder } from "@/backendClient";
import { DocumentKind } from "@/global/types/appTypes";
import {
  type InvoiceDocument,
  type OfferDocument,
  type OverdueNoticeDocument,
} from "@/global/types/entities";
import { getDocumentViewPath } from "@/helpers/routes";

const props = defineProps<{
  id: string | number;
}>();

let visible = ref(false);
let documents = ref<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]>([]);
let isLoading = ref<boolean>(false);

function getDocumentType(doc: OfferDocument | OverdueNoticeDocument | InvoiceDocument) {
  if ("offer_id" in doc) {
    return DocumentKind.offer;
  } else if ("overdue_notice_id" in doc) {
    return DocumentKind.overdueNotice;
  } else {
    return DocumentKind.invoice;
  }
}

async function buttonDocumentFunction() {
  visible.value = true;
  isLoading.value = true;

  documents.value = await getDocumentsByOrder(props.id as string);

  isLoading.value = false;
}
</script>

<template>
  <div class="font-bold my-2">Dokumente</div>
  <div class="flex flex-row gap-4">
    <Button
      @click="buttonDocumentFunction"
      label="Alle Auftragsdokumente anzeigen"
      severity="secondary"
      outlined
      size="small"
    />
  </div>
  <Dialog class="w-full sm:w-4/6" v-model:visible="visible" modal header="Auftragsdokumente">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    {{ documents.length === 0 ? "Keine Dokumente vorhanden" : null }}
    <router-link
      :to="getDocumentViewPath(getDocumentType(document), document.id)"
      v-for="document in documents"
      :key="document.id"
    >
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </router-link>
  </Dialog>
</template>
