<script setup lang="ts">
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import ArticleList from "@/components/articles/ArticleList.vue";

let value = ref();
let articleInfo = ref({
  titel: null,
  text: null,
  unit: null,
  price: null,
});
const selectedArtikel = ref();
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
    <form class="flex flex-col gap-y-3">
      <div>
        <label for="street">Titel</label>
        <InputText id="titel" v-model="articleInfo.titel" class="w-full mt-2 mb-6" />
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
        <div class="grid grid-cols-3 gap-2 mt-6">
          <Dropdown
            v-model="selectedArtikel"
            :options="artikel"
            optionLabel="article"
            placeholder="Art"
            class="w-full"
          />
          <FloatLabel>
            <InputText class="w-full" id="unit" v-model="articleInfo.unit" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputText class="w-full" id="price" v-model="articleInfo.price" />
            <label for="price">Preis</label>
          </FloatLabel>
        </div>
      </div>
      <div class="flex flex-row justify-end gap-4 mr-2">
        <Button icon="pi pi-check" text rounded aria-label="Filter" />
        <Button icon="pi pi-times" severity="danger" text rounded aria-label="Cancel" />
      </div>
    </form>
  </div>

  <ArticleList />
</template>
