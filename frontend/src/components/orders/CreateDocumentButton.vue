<script setup lang="ts">
import Button from "primevue/button";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";

import { createDocumentBySubOrder, isAppErrorCode } from "@/backendClient";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { documentKindLabels } from "@/global/translations";
import { DocumentKind } from "@/global/types/appTypes";
import { ErrorCode } from "@/global/types/backendTypes";
import { getDocumentListPath, getDocumentViewPath } from "@/helpers/routes";

const props = defineProps<{
  id: number;
  kind: DocumentKind;
  hasExistingDocument?: boolean;
}>();
const confirm = useConfirmations();
const toast = useToast();
const notifications = useNotifications();

const toastGroup = ref(`document-creation-${props.kind}-${props.id}`);

const documentLink = ref(getDocumentListPath());
const hasCreatedDocument = ref(false);
const isSingleDocumentKind = computed(
  () => props.kind === DocumentKind.invoice || props.kind === DocumentKind.overdueNotice,
);
const isCreateDisabled = computed(
  () => isSingleDocumentKind.value && (props.hasExistingDocument || hasCreatedDocument.value),
);
const createButtonTooltip = computed(() =>
  isCreateDisabled.value
    ? `Für diese ${documentKindLabels[props.kind]} existiert bereits ein Dokument.`
    : undefined,
);

async function confirmCreateDocument() {
  const confirmationResult = await confirm.showConfirmation("Wollen Sie ein Dokument erstellen?");
  if (!confirmationResult) return;

  try {
    const newDocument = await createDocumentBySubOrder(props.id, props.kind);
    documentLink.value = getDocumentViewPath(props.kind, newDocument.id);
    hasCreatedDocument.value = true;
    toast.add({ severity: "success", group: toastGroup.value, life: 5000 });
  } catch (error) {
    if (isAppErrorCode(error, ErrorCode.DUPLICATE_DOCUMENT)) {
      hasCreatedDocument.value = true;
      notifications.showNotification(
        `Für diese ${documentKindLabels[props.kind]} existiert bereits ein Dokument.`,
        "error",
      );
    } else {
      throw error;
    }
  }
}
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

  <span
    v-tooltip.top="createButtonTooltip"
    class="inline-flex"
    data-testid="create-document-tooltip-wrapper"
  >
    <Button
      @click="confirmCreateDocument"
      :disabled="isCreateDisabled"
      label="Dokument Erstellen"
      data-testid="create-document-button"
      outlined
      size="small"
    />
  </span>
</template>
