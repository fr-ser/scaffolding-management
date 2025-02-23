<script setup lang="ts">
import Button from "primevue/button";

import { createDocumentBySubOrder } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { DocumentKind } from "@/global/types/appTypes";

const props = defineProps<{
  id: number;
  kind: DocumentKind;
}>();
const confirm = useConfirmations();
const notifications = useNotifications();

const confirmCreateDocument = () => {
  confirm.showConfirmation("Wollen Sie ein Dokument erstellen?", async () => {
    await createDocumentBySubOrder(props.id, props.kind);
    notifications.showNotification("Ein neues Dokument wurde erstellt");
  });
};
</script>
<template>
  <Button @click="confirmCreateDocument" label="Dokument Erstellen" outlined size="small" />
</template>
