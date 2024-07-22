<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref } from "vue";
import { onMounted } from "vue";

import { getArticles } from "@/backendClient";
import ArticlesItem from "@/components/articles/ArticleItem.vue";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

async function reloadPage() {
  articlesList.value = (await getArticles()).data;
}
const articlesList = ref<Article[]>([]);

onMounted(async () => {
  const result = await getArticles();
  articlesList.value = result.data;
});
function createNewArticle() {
  articlesList.value.unshift({
    id: "new",
    kind: ArticleKind.heading,
    title: "New Title",
    description: "New Description",
  });
}
let value = ref();
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
      <Button @click="createNewArticle" label="Create" severity="secondary" outlined />
    </div>
    <div class="flex flex-col gap-2 grow overflow-auto">
      <ArticlesItem
        v-for="article in articlesList"
        :article="article"
        :key="article.id"
        @reload-article-view="reloadPage"
      />
    </div>
  </div>
</template>
