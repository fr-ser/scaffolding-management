<script setup lang="ts">
import { saveAs } from "file-saver";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { onMounted, ref, watch } from "vue";

import { deleteDocument, getDocumentPdf, getDocuments } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
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
const selectedProduct = ref<(OfferDocument | OverdueNoticeDocument | InvoiceDocument)[]>([]);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(true);

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
  } else {
    return DocumentKind.invoice;
  }
}

async function removeDocument(doc: OfferDocument | OverdueNoticeDocument | InvoiceDocument) {
  let kind = getDocumentType(doc);
  await deleteDocument(doc.id, kind);
  loadData();
}

function getSelectedIds() {
  return selectedProduct.value.map(function (element) {
    return element.id;
  });
}

async function createPdf() {
  let selectedValuesArray = selectedProduct.value.map(function (element) {
    return { kind: getDocumentType(element), id: element.id };
  });
  const response = await getDocumentPdf(selectedValuesArray);
  notifications.showCreatePdfDocumentNotification();
  saveAs(response, `${getSelectedIds().join("-")}.pdf`);
}

const confirmCreatePdf = () => {
  confirm.showCreateMultiplePdfConfirmation(createPdf, getSelectedIds());
};

watch(search, debounce(loadData, 250));
onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText
          v-model="search"
          placeholder="Suche"
          class="pl-10 w-full"
          data-testid="client-search-input"
        />
      </span>
      <Button
        @click="confirmCreatePdf"
        type="button"
        label="PDF speichern"
        :disabled="!selectedProduct.length"
      />
    </div>
    <div v-if="documentsList" class="grow overflow-auto">
      <DataTable
        v-model:selection="selectedProduct"
        :value="documentsList"
        dataKey="id"
        tableStyle="min-width: 20rem"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
        <Column field="id" header="Nummer" class="hidden md:table-cell"></Column>
        <Column field="" header="Art" class="hidden md:table-cell">
          <template #body="{ data }">
            {{ getDocumentType(data) }}
          </template></Column
        >
        <Column field="client_company_name" header="Titel" class="hidden md:table-cell">
          <template #body="{ data }">
            {{
              `${data.client_company_name} ${data.client_postal_code} ${data.client_street_and_number}`
            }}
          </template></Column
        >
        <Column field="client_company_name" header="Titel" class="table-cell md:hidden">
          <template #body="{ data }">
            <div>{{ `${data.id}` }}</div>
            <div>{{ ` ${data.creation_date}` }}</div>
            <div>{{ `${data.created_at}` }}</div>
            <div>
              {{
                `${data.client_company_name} ${data.client_postal_code} ${data.client_street_and_number}`
              }}
            </div>
          </template></Column
        >
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex flex-col gap-2">
              <div>
                <router-link :to="getDocumentViewPath(getDocumentType(data), data.id)">
                  <Button icon="pi pi-search" severity="secondary" outlined size="small"></Button>
                </router-link>
              </div>
              <Button
                @click="removeDocument(data)"
                icon="pi pi-times"
                severity="danger"
                size="small"
              ></Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <div class="flex justify-center pt-2">
        <Button v-if="hasMore" @click="loadMore">Weitere Dokumente laden</Button>
      </div>
    </div>
  </div>
  <!-- TODO: handle no documents for employees -->
</template>
