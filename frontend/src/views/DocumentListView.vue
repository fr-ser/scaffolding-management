<script setup lang="ts">
import { saveAs } from "file-saver";
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import { onMounted, ref, watch } from "vue";

import { deleteDocument, getDocumentPdf, getDocuments } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { getDocumentViewPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";

const confirm = useConfirmations();
const notifications = useNotifications();

const documentsList = ref<(InvoiceDocument | OfferDocument | OverdueNoticeDocument)[]>([]);
const documentSelection = ref<string[]>([]);
const areAllDocumentsSelected = ref(false);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(false);

async function loadData() {
  const response = await getDocuments({ search: search.value, take: take.value });
  documentsList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

function getDocumentType(doc: OfferDocument | OverdueNoticeDocument | InvoiceDocument) {
  if ("offer_id" in doc) {
    return DocumentKind.offer;
  } else if ("overdue_notice_id" in doc) {
    return DocumentKind.overdueNotice;
  } else if ("invoice_id" in doc) {
    return DocumentKind.invoice;
  } else return neverFunction(doc);
}

function getDocumentTypeById(id: string) {
  for (const document of documentsList.value) {
    if (document.id === id) return getDocumentType(document);
  }
  throw new Error(`No document found for ID: ${id}`);
}

function removeDocument(doc: OfferDocument | OverdueNoticeDocument | InvoiceDocument) {
  confirm.getConfirmation(
    "Sind Sie sicher, dass Sie das Dokument löschen möchten?",
    async function () {
      let kind = getDocumentType(doc);
      await deleteDocument(doc.id, kind);
      loadData();
      notifications.showNotification("Das Dokument wurde gelöscht");
    },
  );
}

watch(areAllDocumentsSelected, (currentValue) => {
  if (currentValue === true) {
    documentSelection.value = documentsList.value.map((document) => document.id);
  } else {
    documentSelection.value = [];
  }
});

async function createPdf() {
  let selectedValuesArray = documentSelection.value.map(function (id) {
    return { kind: getDocumentTypeById(id), id };
  });
  const response = await getDocumentPdf(selectedValuesArray);
  notifications.showNotification("Ein PDF-Dokument wurde erstellt");

  let fileName = documentSelection.value[0] + ".pdf";
  if (documentSelection.value.length > 1) fileName = "dokumente.pdf";
  saveAs(response, fileName);
}

const confirmCreatePdf = () => {
  const message = `Wollen Sie für die folgenden Dokumente eine PDF-Datei erstellen: ${documentSelection.value.join(", ")}?`;
  confirm.getConfirmation(message, createPdf);
};

watch(search, debounce(loadData, 250));

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="flex w-full gap-x-6 mb-3 items-center">
      <Checkbox class="mx-5" v-model="areAllDocumentsSelected" :binary="true" />
      <span class="relative grow flex flex-row items-center">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="search" placeholder="Suche" class="pl-10 w-full" />
      </span>
      <Button
        @click="confirmCreatePdf"
        type="button"
        label="PDF speichern"
        :disabled="documentSelection.length === 0"
      />
    </div>
    <div class="grow overflow-auto">
      <Card class="mt-2" v-for="document in documentsList" :key="document.id">
        <template #content>
          <div class="flex gap-2 flex-row justify-between items-center">
            <div>
              <Checkbox class="mr-5" v-model="documentSelection" :value="document.id" />
              {{ getDocumentType(document) }} - {{ document.id }} - {{ document.order_title }}
            </div>
            <div class="flex flex-row flex-wrap gap-2">
              <div>
                <router-link :to="getDocumentViewPath(getDocumentType(document), document.id)">
                  <Button
                    label="Anschauen"
                    icon="pi pi-search"
                    severity="secondary"
                    outlined
                    size="small"
                  ></Button>
                </router-link>
              </div>
              <Button
                @click="removeDocument(document)"
                label="Löschen"
                icon="pi pi-times"
                severity="danger"
                size="small"
              ></Button>
            </div>
          </div>
        </template>
      </Card>
      <div class="mt-2 flex justify-center">
        <Button v-if="hasMore" @click="loadMore">Weitere Dokumente laden</Button>
      </div>
    </div>
  </div>
  <!-- TODO: handle no documents for employees -->
</template>
