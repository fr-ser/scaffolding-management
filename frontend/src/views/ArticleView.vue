<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { onMounted, ref, watch } from "vue";

import { getArticles } from "@/backendClient";
import ArticlesItem from "@/components/articles/ArticleItem.vue";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";
import { debounce } from "@/helpers/utils";

interface EditableArticle extends Article {
  isNew?: boolean;
}
const articlesList = ref<EditableArticle[]>([]);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(false);

async function loadData() {
  const response = await getArticles({ search: search.value, take: take.value });
  articlesList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

function createNewArticle() {
  articlesList.value.unshift({
    isNew: true,
    id: "", // will be replaced by the backend
    kind: ArticleKind.heading,
    title: "",
    description: "",
    created_at: Date.now(),
    updated_at: Date.now(),
  });
}

watch(search, debounce(loadData, 250));

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="flex w-full gap-x-6 mb-3">
      <span class="relative grow flex flex-row items-center">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText
          v-model="search"
          name="article-search"
          placeholder="Suche (ID, Titel oder Beschreibung)"
          class="pl-10 w-full"
          data-testid="article-search-input"
        />
      </span>
      <Button
        @click="createNewArticle"
        label="Artikel erstellen"
        rounded
        aria-label="Neuen Artikel erstellen"
        data-testid="article-create-button"
      />
    </div>
    <div class="flex flex-col gap-2 grow overflow-auto">
      <ArticlesItem
        v-for="article in articlesList"
        :article="article"
        :is-new="article.isNew"
        :key="article.id"
        @reload-article-view="loadData"
        data-testid="article-card"
      />
    </div>
    <div class="mt-2 flex justify-center">
      <Button v-if="hasMore" @click="loadMore">Weitere Artikel laden</Button>
    </div>
  </div>
</template>
