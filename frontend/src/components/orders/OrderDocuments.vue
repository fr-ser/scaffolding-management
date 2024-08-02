<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getDocumentsByOrder } from "@/backendClient";

const route = useRoute();
let visible = ref(false);
let search = ref("");
let documents = ref([]);
async function getDocuments() {
  documents.value = await getDocumentsByOrder(route.params.id as string);
}
async function openDocumentsList() {
  visible.value = true;
  getDocuments();
}

const filteredDocuments = computed(() => {
  if (!search.value.trim()) {
    return documents.value;
  }
  const query = search.value.toLowerCase();

  return documents.value.filter((document) => document.id.toLowerCase().includes(query));
});
</script>

<template>
  <div class="font-bold my-2">Documente</div>
  <div>
    <Button
      @click="openDocumentsList"
      label="Alle auftragsdocument(e) anzeigen"
      severity="secondary"
      outlined
      size="small"
    />
  </div>
  <Dialog v-model:visible="visible" modal header="Order documents" :style="{ width: '25rem' }">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow bg-zinc-100">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="search" placeholder="Suche" class="pl-10 w-full" />
      </span>
    </div>
    <div v-for="document in filteredDocuments">
      <div>{{ document.id }}</div>
    </div>
  </Dialog>
</template>
