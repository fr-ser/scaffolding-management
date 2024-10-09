<script setup lang="ts">
import Button from "primevue/button";
import { ref } from "vue";

import { createDocumentBySubOrder } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
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
const confirm = useConfirmations();
const notifications = useNotifications();
// функция для создания документа компонента с бэкенда в которую надо передать тип и айди
//
let documents = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();
async function createDocument() {
  documents.value = await createDocumentBySubOrder(props.id, props.kind);
  console.log(documents.value);
  notifications.showCreateNewDocumentNotification();
}
const confirmCreateDocument = () => {
  confirm.showCreateDocumentConfirmation(createDocument);
};
</script>
<template>
  <Button @click="confirmCreateDocument" label="Dokument Erstellen" outlined size="small" />
</template>
