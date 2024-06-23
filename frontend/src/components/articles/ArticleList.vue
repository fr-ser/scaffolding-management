<script setup lang="ts">
import { getArticles } from "@/backendClient";
import type { Article } from "@/global/types/entities";
import { onMounted, ref } from "vue";

const articles = ref([] as Article[]);

onMounted(async () => {
  articles.value = await getArticles();
})

</script>

<template>
  Articles:
  <ul>
    <li v-for="article in articles" :key="article.id">
      {{ article }}
    </li>
  </ul>
</template>
