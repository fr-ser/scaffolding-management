<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FileUpload, {
  type FileUploadRemoveEvent,
  type FileUploadSelectEvent,
} from "primevue/fileupload";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { defineEmits, ref } from "vue";

import { sendDocumentAsEmail } from "@/backendClient";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";

const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
const VITE_COMPANY_STREET_AND_NUMBER = import.meta.env.VITE_COMPANY_STREET_AND_NUMBER;
const VITE_COMPANY_POSTAL_CODE_AND_CITY = import.meta.env.VITE_COMPANY_POSTAL_CODE_AND_CITY;
const VITE_COMPANY_PHONE = import.meta.env.VITE_COMPANY_PHONE;
const VITE_COMPANY_MOBILE_PHONE = import.meta.env.VITE_COMPANY_MOBILE_PHONE;
const VITE_COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const VITE_COMPANY_HOMEPAGE = import.meta.env.VITE_COMPANY_HOMEPAGE;

const props = defineProps<{
  kind: DocumentKind;
  document: OfferDocument | OverdueNoticeDocument | InvoiceDocument;
}>();

const emit = defineEmits(["hideDialog"]);
function hideDialog() {
  emit("hideDialog");
}

const confirm = useConfirmations();
const notification = useNotifications();

const files = ref<File[]>([]);
const onSelect = (event: FileUploadSelectEvent) => {
  files.value = event.files;
};

const onRemove = (event: FileUploadRemoveEvent) => {
  files.value = event.files;
};

let emailKind = "";

if (props.kind === DocumentKind.invoice) {
  emailKind = "die Rechnung";
} else if (props.kind === DocumentKind.offer) {
  emailKind = "das Angebot";
} else if (props.kind === DocumentKind.overdueNotice) {
  emailKind = "die Mahnung";
} else neverFunction(props.kind);

const emailRecipient = ref(props.document.client_email || "");
const emailSubject = ref(`${VITE_COMPANY_NAME} - ${props.kind} - ${props.document.id}`);
const emailAttachmentName = ref(`${props.kind}_${props.document.id}.pdf`);
const emailMessage = ref(`Sehr geehrte Damen und Herren,

anbei erhalten Sie ${emailKind} für Ihr BV: ${props.document.order_title}.

Mit freundlichen Grüßen

${VITE_COMPANY_NAME}

${VITE_COMPANY_STREET_AND_NUMBER}
${VITE_COMPANY_POSTAL_CODE_AND_CITY}

${VITE_COMPANY_EMAIL}
${VITE_COMPANY_HOMEPAGE}


Mobil: ${VITE_COMPANY_MOBILE_PHONE}
Tel.: ${VITE_COMPANY_PHONE}
`);

async function sendClick() {
  const confirmationResult = await confirm.showConfirmation("Möchten Sie die E-Mail senden?");
  if (!confirmationResult) return;

  try {
    await sendDocumentAsEmail(
      {
        kind: props.kind,
        id: props.document.id,
        recipient: emailRecipient.value,
        message: emailMessage.value,
        subject: emailSubject.value,
        attachmentName: emailAttachmentName.value,
      },
      files.value,
    );
  } catch (error) {
    notification.showNotification(
      "Die E-Mail wurde nicht versandt. Es gab ein technisches Problem.",
      "error",
    );
    return;
  }

  notification.showNotification("Die E-Mail wurde versandt.");
  emit("hideDialog");
}
</script>

<template>
  <Dialog visible class="w-4/5" modal header="E-Mail:">
    <div class="flex flex-col gap-2">
      <label for="recipient">An:</label>
      <InputText id="recipient" v-model="emailRecipient" />
    </div>
    <div class="flex flex-col gap-2 mt-2">
      <label for="subject">Betreff:</label>
      <InputText id="subject" v-model="emailSubject" />
    </div>
    <div class="flex flex-col gap-2 mt-2">
      <label for="message">Nachricht:</label>
      <Textarea class="leading-none" v-model="emailMessage" autoResize />
    </div>
    <div class="flex flex-col gap-2 mt-2">
      <label for="attachment">Dateiname Dokument (Anhang):</label>
      <InputText id="attachment" v-model="emailAttachmentName" />
    </div>
    <div class="my-2">
      <FileUpload
        name="file"
        :showCancelButton="false"
        :showUploadButton="false"
        customUpload
        multiple
        chooseLabel="Zusätzlichen Anhang hinzufügen"
        :pt="{
          pcFileBadge: { root: { style: { display: 'none' } } },
        }"
        @select="onSelect"
        @remove="onRemove"
      />
    </div>
    <div class="mt-3 flex justify-end gap-2">
      <Button type="button" label="Abbrechen" severity="secondary" @click="hideDialog"></Button>
      <Button type="button" label="Senden" @click="sendClick"></Button>
    </div>
  </Dialog>
</template>
