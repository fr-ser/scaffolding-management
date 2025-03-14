<script setup lang="ts">
import Menubar from "primevue/menubar";
import { computed } from "vue";
import { useRoute } from "vue-router";

import { UserPermissions } from "@/global/types/backendTypes";
import * as routes from "@/helpers/routes";
import { useUserStore } from "@/store";

const route = useRoute();
const userStore = useUserStore();

const items = computed(() => {
  const baseRoutes = [
    {
      label: "Kunden",
      icon: "pi pi-user",
      route: routes.getClientListPath(),
    },
    {
      label: "Aufträge",
      icon: "pi pi-shop",
      route: routes.getOrderListPath(),
    },
  ];

  if (userStore.permissions.includes(UserPermissions.SUB_ORDERS_VIEW)) {
    baseRoutes.push({
      label: "Übersicht",
      icon: "pi pi-sitemap",
      route: routes.getOverviewPath(),
    });
  }

  if (userStore.permissions.includes(UserPermissions.DOCUMENTS_VIEW)) {
    baseRoutes.push({
      label: "Dokumente",
      icon: "pi pi-file-pdf",
      route: routes.getDocumentListPath(),
    });
  }

  if (userStore.permissions.includes(UserPermissions.ARTICLES_VIEW)) {
    baseRoutes.push({
      label: "Artikel",
      icon: "pi pi-list",
      route: routes.getArticleListPath(),
    });
  }

  return baseRoutes;
});
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
