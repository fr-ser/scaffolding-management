<script setup lang="ts">
import Toast from "primevue/toast";
import { RouterView } from "vue-router";

import NavigationBar from "@/components/NavigationBar.vue";
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <Toast />
    <NavigationBar />
    <div class="px-3 py-3 bg-neutral-100 grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
