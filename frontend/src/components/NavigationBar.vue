<script setup lang="ts">
import Menubar from "primevue/menubar";
import { ref } from "vue";

import { ROUTES } from "@/router";

const items = ref([
  {
    label: ROUTES.CLIENTS.label,
    icon: "pi pi-user",
    route: ROUTES.CLIENTS.path,
  },
  {
    label: ROUTES.ORDER.label,
    icon: "pi pi-shopping-cart",
    route: ROUTES.ORDER.path,
  },
  {
    label: ROUTES.ORDERS.label,
    icon: "pi pi-search",
    route: ROUTES.ORDERS.path,
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
  <div class="card">
    <Menubar :model="items" data-testid="navigation-bar">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>
      </template>
    </Menubar>
  </div>
</template>
