<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { ref } from "vue";
import { onMounted } from "vue";
import { watch } from "vue";

import { getArticles } from "@/backendClient";
import ArticlesItem from "@/components/articles/ArticleItem.vue";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

interface EditableArticle extends Article {
  isNew?: boolean;
}

let search = ref<string>("");

async function reloadPage() {
  // TODO: use pagination
  articlesList.value = (await getArticles(search.value)).data;
}

const articlesList = ref<EditableArticle[]>([]);

function createNewArticle() {
  // TODO: user the createArticle type
  articlesList.value.unshift({
    id: crypto.randomUUID(),
    updated_at: 1,
    created_at: 1,
    kind: ArticleKind.heading,
    title: "New Title",
    description: "New Description",
    isNew: true,
  });
}

watch(search, async () => {
  // TODO: add debounce
  reloadPage();
});

onMounted(async () => {
  reloadPage();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="search" placeholder="Suche" class="pl-10 w-full" />
      </span>
      <Button @click="createNewArticle" icon="pi pi-plus" rounded outlined aria-label="Filter" />
    </div>
    <div class="flex flex-col gap-2 grow overflow-auto">
      <ArticlesItem
        v-for="article in articlesList"
        :article="article"
        :is-new="article.isNew"
        :key="article.id"
        @reload-article-view="reloadPage"
      />
    </div>
  </div>
</template>
