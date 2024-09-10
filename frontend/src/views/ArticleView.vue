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

let search = ref<string>("");

async function reloadPage() {
  // TODO: use pagination
  articlesList.value = (await getArticles(search.value)).data;
}

const articlesList = ref<EditableArticle[]>([]);

function createNewArticle() {
  articlesList.value.unshift({
    id: crypto.randomUUID(),
    kind: ArticleKind.heading,
    title: "New Title",
    description: "New Description",
    isNew: true,
    // TODO: do not use "any"
  } as any);
}

watch(search, debounce(reloadPage, 250));

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
        label="Neu"
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
        @reload-article-view="reloadPage"
        data-testid="article-card"
      />
    </div>
  </div>
</template>
