<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

const articlesList = ref([{ id: 1 }, { id: 2 }, { id: 3 }]);

let value = ref();
let articleInfo = ref({
  titel: null,
  text: null,
  unit: null,
  price: null,
});
const selectedArtikel = ref(null);
const artikel = ref([{ article: "Artikel" }, { article: "Hinweis" }]);
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="value" placeholder="Suche" class="pl-10 w-full" />
      </span>
      <Button label="Search" severity="secondary" outlined />
    </div>
    <div class="flex flex-col gap-2 grow overflow-auto">
      <Card v-for="article in articlesList" :key="article.id">
        <template #content>
          <form class="flex flex-col gap-y-3">
            <div>
              <FloatLabel class="mb-6 mt-2">
                <InputText id="titel" v-model="articleInfo.titel" class="w-full" />
                <label for="titel">Titel</label>
              </FloatLabel>
              <FloatLabel>
                <Textarea
                  id="text"
                  v-model="articleInfo.text"
                  class="w-full"
                  autoResize
                  rows="5"
                  cols="30"
                />
                <label for="text">Bezeichnung</label>
              </FloatLabel>
              <div class="grid grid-cols-2 gap-2 mt-6">
                <FloatLabel>
                  <Dropdown
                    v-model="selectedArtikel"
                    :options="artikel"
                    optionLabel="article"
                    class="w-full"
                    id="select"
                  />
                  <label for="select">Art</label>
                </FloatLabel>
                <FloatLabel>
                  <InputText class="w-full" id="unit" v-model="articleInfo.unit" />
                  <label for="unit">Einheit</label>
                </FloatLabel>
              </div>
            </div>
            <div class="flex flex-row justify-end gap-4 mt-4">
              <FloatLabel class="grow">
                <InputText class="w-full" id="price" v-model="articleInfo.price" />
                <label for="price">Preis</label>
              </FloatLabel>
              <Button icon="pi pi-check" text rounded aria-label="Filter" />
              <Button icon="pi pi-times" severity="danger" text rounded aria-label="Cancel" />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>
