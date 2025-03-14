<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import { onMounted } from "vue";
import { RouterView } from "vue-router";

import NavigationBar from "@/components/NavigationBar.vue";
import { useUserStore } from "@/store";

const userStore = useUserStore();

onMounted(() => {
  userStore.loadPermissions();
});
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden w-full">
    <Toast class="w-3/4 sm:w-max" />
    <ConfirmDialog class="w-max"></ConfirmDialog>
    <NavigationBar />
    <div class="px-3 py-3 bg-neutral-100 grow overflow-auto">
      <RouterView />
    </div>
  </div>
</template>
