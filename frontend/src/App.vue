<script setup lang="ts">
import { RouterView } from "vue-router";

import NavigationBar from "@/components/NavigationBar.vue";
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <NavigationBar />
    <div class="px-3 py-3 bg-neutral-100 grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
