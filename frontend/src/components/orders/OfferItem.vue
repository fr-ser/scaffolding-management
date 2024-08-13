<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, ref, watch } from "vue";

import { getArticles } from "@/backendClient";
import { formatNumber, getVatRate } from "@/global/helpers";
import { ArticleKind } from "@/global/types/appTypes";
import type { OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Article } from "@/global/types/entities";
import { calculateBrutto } from "@/helpers/utils";

const props = defineProps<{
  index: number;
  item: OfferItemCreate;
  offerDate: string;
}>();

const emit = defineEmits<{
  updated: [item: OfferItemCreate];
  deleted: [id: number];
}>();

let filteredArticles = ref<Article[]>([]);
let isArticlesListVisible = ref(false);

let editableItem = ref<OfferItemCreate>(props.item);

async function openArticlesList(kind: ArticleKind) {
  isArticlesListVisible.value = true;
  const articlesList = (await getArticles()).data;
  filteredArticles.value = articlesList.filter((article) => article.kind === kind);
}
let grossValue = computed<string>(() => {
  return calculateBrutto(editableItem.value, props.offerDate);
});
function chooseArticle(article: Article) {
  editableItem.value.title = article.title;
  editableItem.value.description = article.description;
  if (article.kind === ArticleKind.item) {
    editableItem.value.unit = article.unit;
    editableItem.value.price = article.price;
  }
  isArticlesListVisible.value = false;
}
function onDeleteOfferItem() {
  emit("deleted", editableItem.value.id);
}

watch(
  editableItem,
  () => {
    emit("updated", editableItem.value);
  },
  { deep: true },
);
</script>

<template>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row justify-between">
          <p class="font-bold">Position {{ index }}</p>
          <div>
            <Button
              @click="openArticlesList(props.item.kind)"
              class="mr-3"
              icon="pi pi-search"
              size="small"
              severity="secondary"
              text
              raised
            />
            <Button @click="onDeleteOfferItem" icon="pi pi-times" severity="danger" text raised />
          </div>
        </div>
        <FloatLabel>
          <InputText id="titel" v-model="editableItem.title" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="editableItem.description"
            class="w-full"
            autoResize
            rows="3"
            cols="30"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <div v-if="item.kind === ArticleKind.item" class="flex flex-col gap-y-6">
          <FloatLabel>
            <InputNumber id="number" v-model="editableItem.amount" class="w-full" />
            <label for="number">Anzahl</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="unit" v-model="editableItem.unit" class="w-full" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputNumber id="price" v-model="editableItem.price" class="w-full" />
            <label for="unit">Preis</label>
          </FloatLabel>
          <div>Brutto: {{ grossValue }}</div>
        </div>
      </div>
    </template>
  </Card>
  <Dialog class="w-full sm:w-4/6" v-model:visible="isArticlesListVisible" modal header="Artikel">
    <div v-for="article in filteredArticles" :key="article.id">
      <div
        @click="chooseArticle(article)"
        class="border border-slate-300 hover:border-primary ps-4 py-1 my-2"
      >
        {{ article.title }}
      </div>
    </div>
  </Dialog>
</template>
