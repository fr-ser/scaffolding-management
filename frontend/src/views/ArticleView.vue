<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import ArticlesItem from "@/components/articles/ArticleItem.vue";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const articlesList = ref<Article[]>([
  {
    id: "1",
    kind: ArticleKind.heading,
    title: "title 1",
    description: "description 1",
  },
  {
    id: "2",
    kind: ArticleKind.item,
    title: "title 2",
    description: "description 2",
    unit: "unit 2",
    price: 2.2,
  },
  {
    id: "3",
    kind: ArticleKind.heading,
    title: "title 3",
    description: "description 3",
  },
]);

let value = ref();
let articleInfo = ref({
  titel: null,
  text: null,
  unit: null,
  price: null,
});
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
      <Button label="Create" severity="secondary" outlined />
    </div>
    <div class="flex flex-col gap-2 grow overflow-auto">
      <ArticlesItem v-for="article in articlesList" :article="article" :key="article.id" />
    </div>
  </div>
</template>
