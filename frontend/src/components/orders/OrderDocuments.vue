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
import { ROUTES } from "@/router";

const props = defineProps<{
  id: string | number;
  kind?: DocumentKind;
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
function buttonLabel() {
  if (!props.kind) {
    return "Alle Auftragsdokumente anzeigen";
  }
  if (props.kind === DocumentKind.offer) {
    return "Show all Offer Documents";
  }
  if (props.kind === DocumentKind.invoice) {
    return "Show all Invoice Documents";
  } else {
    return "Show all Overdue Notice Documents";
  }
}
async function buttonDocumentFunction() {
  visible.value = true;
  isLoading.value = true;
  if (!props.kind) {
    documents.value = await getDocumentsByOrder(props.id as string);
  } else {
    documents.value = await getDocumentsBySubOrder(props.id as number, props.kind as DocumentKind);
  }
  isLoading.value = false;
}
</script>

<template>
  <div v-if="!kind" class="font-bold my-2">Dokumente</div>
  <div class="flex flex-row gap-4">
    <Button
      @click="buttonDocumentFunction"
      :label="`${buttonLabel()}`"
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
    <!-- сделать ссылку для документов тут  -->

    <router-link
      :to="`${ROUTES.DOCUMENTS.path}/${document.id}?sub_type=${getDocumentType(document)}`"
      v-for="document in documents"
      :key="document.id"
    >
      <div class="border border-slate-300 hover:border-primary ps-4 py-1">{{ document.id }}</div>
    </router-link>
  </Dialog>
</template>
