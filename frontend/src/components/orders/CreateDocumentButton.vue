<script setup lang="ts">
import Button from "primevue/button";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

import { createDocumentBySubOrder } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import { DocumentKind } from "@/global/types/appTypes";
import { getDocumentListPath, getDocumentViewPath } from "@/helpers/routes";

const props = defineProps<{
  id: number;
  kind: DocumentKind;
}>();
const confirm = useConfirmations();
const toast = useToast();

const toastGroup = ref(`document-creation-${props.kind}-${props.id}`);

const documentLink = ref(getDocumentListPath());

const confirmCreateDocument = () => {
  documentLink.value = "2";
  confirm.showConfirmation("Wollen Sie ein Dokument erstellen?", async () => {
    const newDocument = await createDocumentBySubOrder(props.id, props.kind);

    documentLink.value = getDocumentViewPath(props.kind, newDocument.id);

    toast.add({ severity: "success", group: toastGroup.value, life: 5000 });
  });
};
</script>

<template>
  <Toast :group="toastGroup">
    <template #message>
      <span> Ein Dokumente wurde erstellt: </span>
      <router-link :key="documentLink" :to="documentLink">
        <Button label="Link zum Dokument" link />
      </router-link>
    </template>
  </Toast>

  <Button @click="confirmCreateDocument" label="Dokument Erstellen" outlined size="small" />
</template>
