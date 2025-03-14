<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import FileUpload, { type FileUploadUploadEvent } from "primevue/fileupload";
import InlineMessage from "primevue/inlinemessage";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";

import { deleteOrderAttachment, getOrderAttachments } from "@/backendClient";
import useConfirmation from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { type DropboxFile, UserPermissions } from "@/global/types/backendTypes";
import { useUserStore } from "@/store";

const props = defineProps<{
  orderId: string;
}>();

const userStore = useUserStore();
const notification = useNotifications();
const confirmation = useConfirmation();

const isModalVisible = ref(false);
const isFileBeingUploaded = ref(false);
const areAttachmentsLoaded = ref(false);
const attachments = ref<DropboxFile[]>([]);

async function showAttachments() {
  isModalVisible.value = true;
  if (areAttachmentsLoaded.value) return;

  attachments.value = await getOrderAttachments(props.orderId);
  areAttachmentsLoaded.value = true;
}

function onUpload(event: FileUploadUploadEvent) {
  isFileBeingUploaded.value = false;
  notification.showNotification("Upload ist erfolgt", "success");
  if (areAttachmentsLoaded.value) {
    const response = JSON.parse(event.xhr.response) as DropboxFile;
    attachments.value.push(response);
  }
}

function onDeleteClick(fileName: string) {
  confirmation.getConfirmation(
    `Soll die Datei '${fileName}' wirklich gelöscht werden?`,
    async () => {
      await deleteOrderAttachment(props.orderId, fileName);
      notification.showNotification(`Die Datei '${fileName}' wurde gelöscht`);
      attachments.value = attachments.value.filter((file) => file.name !== fileName);
    },
  );
}
</script>

<template>
  <div class="font-bold my-2">Anlagen</div>
  <div class="flex flex-row gap-4">
    <Button
      label="Anlagen anzeigen"
      severity="secondary"
      outlined
      size="small"
      @click="showAttachments"
    />
    <div
      v-if="userStore.permissions.includes(UserPermissions.ATTACHMENTS_EDIT)"
      class="flex flex-row"
    >
      <FileUpload
        mode="basic"
        name="file"
        :url="`/api/orders/${props.orderId}/attachments`"
        accept="image/*"
        @before-upload="isFileBeingUploaded = true"
        @upload="onUpload"
        chooseLabel="Anlage hinzufügen"
      />
      <ProgressSpinner v-if="isFileBeingUploaded" style="height: 40px" />
    </div>
  </div>
  <Dialog v-model:visible="isModalVisible" header="Anlagen">
    <div v-if="!areAttachmentsLoaded" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <InlineMessage v-else-if="attachments.length === 0" severity="info"
      >Keine Anlagen vorhanden</InlineMessage
    >
    <div v-else>
      <Card v-for="attachment in attachments" :key="attachment.name" pt:content:class="py-0">
        <template #content>
          <div class="flex flex-row items-center justify-between">
            <span>
              {{ attachment.name }}
            </span>
            <span class="flex gap-2">
              <a :href="attachment.link" target="_blank" rel="noopener">
                <Button icon="pi pi-download" aria-label="Runterladen" size="small" />
              </a>
              <Button
                icon="pi pi-trash"
                aria-label="Löschen"
                size="small"
                @click="onDeleteClick(attachment.name)"
              />
            </span>
          </div>
        </template>
      </Card>
    </div>
  </Dialog>
</template>
