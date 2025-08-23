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
      label: "Berichte",
      icon: "pi pi-sitemap",
      route: routes.getReportingPath(),
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

function isSubRoute(path: string) {
  if (route.path === "/") return false;
  else return route.path.startsWith(path);
}
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
      <RouterLink v-slot="{ href, navigate, isActive }" :to="item.route" custom>
        <a
          :href="href"
          v-bind="props.action"
          @click="navigate"
          :class="{ 'menu-item-active': isActive || isSubRoute(item.route) }"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </RouterLink>
    </template>
  </Menubar>
</template>

<style scoped lang="scss">
.menu-item-active {
  background-color: var(--p-surface-50);
  color: var(--p-primary-700);
  border-bottom: 2px solid var(--p-primary-500);
  font-weight: 500;
}
</style>
