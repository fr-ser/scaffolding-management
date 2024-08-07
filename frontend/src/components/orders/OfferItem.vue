<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { getArticles } from "@/backendClient";
import type { Article, OfferItem } from "@/global/types/entities";

const props = defineProps<{
  id: string;
  valueOfferItem: Boolean;
}>();

let isArticlesListVisible = ref(false);
const articlesList = ref<Article[]>([]);

async function openArticlesList() {
  isArticlesListVisible.value = true;
  articlesList.value = (await getArticles()).data;
}

let offerInfo = ref({
  title: "",
  description: "",
  number: 0,
  unit: "",
  price: 0,
});
</script>

<template>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row justify-between">
          <p class="font-bold">Position {{ id }}</p>
          <Button
            @click="openArticlesList"
            icon="pi pi-search"
            size="small"
            severity="secondary"
            text
            raised
          />
        </div>

        <FloatLabel>
          <InputText id="titel" v-model="offerInfo.title" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="offerInfo.description"
            class="w-full"
            autoResize
            rows="3"
            cols="30"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <div v-if="valueOfferItem" class="flex flex-col gap-y-6">
          <FloatLabel>
            <InputNumber id="number" v-model="offerInfo.number" class="w-full" />
            <label for="number">Anzahl</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="unit" v-model="offerInfo.unit" class="w-full" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputNumber id="price" v-model="offerInfo.price" class="w-full" />
            <label for="unit">Preis</label>
          </FloatLabel>
          <div>Brutto:</div>
        </div>
      </div>
    </template>
  </Card>
  <Dialog class="w-full sm:w-4/6" v-model:visible="isArticlesListVisible" modal header="Artikel">
    <div v-for="article in articlesList" :key="article.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1 my-2">
        {{ article.title }}
      </div>
    </div>
  </Dialog>
</template>
