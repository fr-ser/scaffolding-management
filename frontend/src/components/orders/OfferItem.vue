<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import { getArticles } from "@/backendClient";
import { getVatRate } from "@/global/helpers";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const props = defineProps<{
  index: number;
  type: ArticleKind;
}>();
let filteredArticles = ref<Article[]>([]);
let isArticlesListVisible = ref(false);

async function openArticlesList(articleType: ArticleKind) {
  isArticlesListVisible.value = true;
  const articlesList = (await getArticles()).data;
  filteredArticles.value = articlesList.filter((article) => article.kind === articleType);
}

const bruttoValue = computed(() => {
  if (offerItemInfo.value.number && offerItemInfo.value.price) {
    let number = (
      offerItemInfo.value.number *
      offerItemInfo.value.price *
      (1 + getVatRate({ isoDate: "" }))
    ).toFixed(2);
    return number;
  }
});

let offerItemInfo = ref({
  title: "",
  description: "",
  number: props.type === ArticleKind.item ? 0 : null,
  unit: props.type === ArticleKind.item ? "" : null,
  price: props.type === ArticleKind.item ? 0 : null,
});
function handleClick(article: Article) {
  offerItemInfo.value.title = article.title;
  offerItemInfo.value.description = article.description;
  if (article.kind === ArticleKind.item) {
    offerItemInfo.value.unit = article.unit ?? null;
    offerItemInfo.value.price = article.price ?? null;
  }
  isArticlesListVisible.value = false;
}
</script>

<template>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row justify-between">
          <p class="font-bold">Position {{ index }}</p>
          <Button
            @click="openArticlesList(props.type)"
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
          <div>Brutto: {{ bruttoValue ?? 0 }} €</div>
        </div>
      </div>
    </template>
  </Card>
  <Dialog class="w-full sm:w-4/6" v-model:visible="isArticlesListVisible" modal header="Artikel">
    <div v-for="article in filteredArticles" :key="article.id">
      <div
        @click="handleClick(article)"
        class="border border-slate-300 hover:border-primary ps-4 py-1 my-2"
      >
        {{ article.title }}
      </div>
    </div>
  </Dialog>
</template>
