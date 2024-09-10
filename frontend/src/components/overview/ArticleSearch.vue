<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { ref, watch } from "vue";

import { getArticles } from "@/backendClient";
import type { Article } from "@/global/types/entities";

const emit = defineEmits<{
  findArticle: [client: Article | undefined];
}>();
let articlesList = ref<Article[]>([]);
let isArticlesListVisible = ref(false);
let selectedArticleId = ref();
async function openArticlesList() {
  isArticlesListVisible.value = true;
  articlesList.value = (await getArticles()).data;
}
function chooseArticle(article: Article) {
  selectedArticleId.value = article.id;
  isArticlesListVisible.value = false;
}
function deleteArticleOrPosition() {
  selectedArticleId.value = undefined;
}
watch(
  selectedArticleId,
  () => {
    emit("findArticle", selectedArticleId.value);
  },
  { deep: true },
);
</script>
<template>
  <Button
    v-if="!selectedArticleId"
    class="h-1/2 flex self-start mt-2 md:self-end mb-1"
    @click="openArticlesList()"
    type="button"
    label="Position/Artikel"
  />
  <section v-if="selectedArticleId" class="inline-flex flex-row gap-2 ml-5">
    <span class="self-center">{{ selectedArticleId }}</span>
    <Button @click="deleteArticleOrPosition()" icon="pi pi-times" severity="danger" text raised />
  </section>
  <Dialog class="w-full sm:w-4/6" v-model:visible="isArticlesListVisible" modal header="Artikel">
    <div v-for="article in articlesList" :key="article.id">
      <div
        @click="chooseArticle(article)"
        class="border border-slate-300 hover:border-primary ps-4 py-1 my-2"
      >
        {{ article.id }} {{ article.title }} {{ article.description }}
      </div>
    </div>
  </Dialog>
</template>
