<script setup lang="ts">
import Menubar from "primevue/menubar";
import { ref } from "vue";
import { useRoute } from "vue-router";

import { ROUTES } from "@/router";

const route = useRoute();

const items = ref([
  {
    label: ROUTES.CLIENT.label,
    icon: "pi pi-user",
    route: ROUTES.CLIENT.path,
  },
  {
    label: ROUTES.ORDER.label,
    icon: "pi pi-shopping-cart",
    route: ROUTES.ORDER.path,
  },
  {
    label: ROUTES.DOCUMENTS.label,
    icon: "pi pi-file",
    route: ROUTES.DOCUMENTS.path,
  },
  {
    label: ROUTES.ARTICLES.label,
    icon: "pi pi-list",
    route: ROUTES.ARTICLES.path,
  },
]);
</script>

<template>
  <Menubar
    :model="items"
    :pt="{
      // fixes https://github.com/primefaces/primevue/issues/6141
      // and https://github.com/primefaces/primevue/issues/6103
      action: {
        ariaHidden: false,
      },
    }"
  >
    <template #item="{ item, props }">
      <RouterLink v-slot="{ href, navigate }" :to="item.route" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </RouterLink>
    </template>
    <template #end>
      <h1 class="font-semibold">{{ route.meta?.label }}</h1>
    </template>
  </Menubar>
</template>
