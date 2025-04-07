<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, ref, watch } from "vue";

import { getArticles } from "@/backendClient";
import { formatNumber, getVatRate } from "@/global/helpers";
import { ArticleKind } from "@/global/types/appTypes";
import type { InvoiceItemCreate, OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Article } from "@/global/types/entities";

const props = defineProps<{
  index: number;
  item: OfferItemCreate | InvoiceItemCreate;
  vatDate: string;
  isAppManagedPosition?: boolean;
}>();

const emit = defineEmits<{
  updated: [item: OfferItemCreate | InvoiceItemCreate];
  deleted: [];
}>();

let filteredArticles = ref<Article[]>([]);
let isArticlesListVisible = ref(false);

let editableItem = ref<OfferItemCreate | InvoiceItemCreate>(props.item);

async function openArticlesList(kind: ArticleKind) {
  isArticlesListVisible.value = true;
  const articlesList = (await getArticles()).data;
  filteredArticles.value = articlesList.filter((article) => article.kind === kind);
}

let vatRate = computed(() => {
  return getVatRate({ isoDate: props.vatDate });
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
  emit("deleted");
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
  <Divider class="mt-6" />
  <div class="mb-2 flex flex-col gap-y-6">
    <div class="flex flex-row justify-between items-center">
      <p class="font-bold mr-4">Position {{ index }}</p>
      <div v-if="editableItem.price != null && editableItem.amount != null">
        Netto:
        {{
          formatNumber(editableItem.price * editableItem.amount, {
            currency: true,
          })
        }}
        - Brutto:
        {{
          formatNumber(editableItem.price * editableItem.amount * (1 + vatRate), {
            currency: true,
          })
        }}
      </div>
      <div>
        <Button
          @click="openArticlesList(props.item.kind)"
          class="mr-3"
          icon="pi pi-search"
          size="small"
          severity="secondary"
          text
          raised
          :disabled="isAppManagedPosition"
        />
        <Button @click="onDeleteOfferItem" icon="pi pi-times" severity="danger" text raised />
      </div>
    </div>
    <div class="flex gap-6 flex-col sm:flex-row">
      <section data-name="description" class="grow flex flex-col gap-6">
        <FloatLabel>
          <InputText
            id="titel"
            v-model="editableItem.title"
            class="w-full"
            :disabled="isAppManagedPosition"
          />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="editableItem.description"
            class="w-full"
            autoResize
            rows="4"
            cols="30"
            :disabled="isAppManagedPosition"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
      </section>
      <section
        data-name="amount"
        v-if="item.kind === ArticleKind.item"
        class="basis-48 flex flex-col gap-6"
      >
        <FloatLabel>
          <InputNumber
            id="number"
            v-model="editableItem.amount"
            locale="de-DE"
            :minFractionDigits="0"
            :maxFractionDigits="10"
            class="w-full"
            :disabled="isAppManagedPosition"
          />
          <label for="number">Anzahl</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            id="unit"
            v-model="editableItem.unit"
            class="w-full"
            :disabled="isAppManagedPosition"
          />
          <label for="unit">Einheit</label>
        </FloatLabel>
        <FloatLabel>
          <InputNumber
            id="price"
            v-model="editableItem.price"
            locale="de-DE"
            :minFractionDigits="0"
            :maxFractionDigits="10"
            class="w-full"
            :disabled="isAppManagedPosition"
          />
          <label for="unit">Preis</label>
        </FloatLabel>
      </section>
    </div>
  </div>
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
