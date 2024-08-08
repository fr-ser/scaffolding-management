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
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const props = defineProps<{
  index: string;
  type: ArticleKind;
}>();

let isArticlesListVisible = ref(false);
const articlesList = ref<Article[]>([]);

async function openArticlesList() {
  isArticlesListVisible.value = true;
  articlesList.value = (await getArticles()).data;
}

let offerItemInfo = ref({
  title: "",
  description: "",
  number: props.type === ArticleKind.item ? 0 : null,
  unit: props.type === ArticleKind.item ? "" : null,
  price: props.type === ArticleKind.item ? 0 : null,
});
</script>

<template>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row justify-between">
          <p class="font-bold">Position {{ index }}</p>
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
          <InputText id="titel" v-model="offerItemInfo.title" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="offerItemInfo.description"
            class="w-full"
            autoResize
            rows="3"
            cols="30"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <div v-if="type === ArticleKind.item" class="flex flex-col gap-y-6">
          <FloatLabel>
            <InputNumber id="number" v-model="offerItemInfo.number" class="w-full" />
            <label for="number">Anzahl</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="unit" v-model="offerItemInfo.unit" class="w-full" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputNumber id="price" v-model="offerItemInfo.price" class="w-full" />
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
