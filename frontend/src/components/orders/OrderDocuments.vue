<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { ref } from "vue";

let visible = ref(false);
let search = ref("");
let documents = ref([
  { name: "doc 1" },
  { name: "doc 2" },
  { name: "doc 3" },
  { name: "doc 4" },
  { name: "doc 5" },
]);
</script>

<template>
  <div class="font-bold my-2">Documente</div>
  <div>
    <Button
      @click="visible = true"
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
    <div v-for="document in documents">
      <div>{{ document.name }}</div>
    </div>
  </Dialog>
</template>
