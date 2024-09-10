<script setup lang="ts">
import Menubar from "primevue/menubar";
import { ref } from "vue";
import { useRoute } from "vue-router";

import * as routes from "@/helpers/routes";

const route = useRoute();

const items = ref([
  {
    label: "Kunden",
    icon: "pi pi-user",
    route: routes.getClientListPath(),
  },
  {
    label: "Aufträge",
    icon: "pi pi-shopping-cart",
    route: routes.getOrderListPath(),
  },
  {
    label: "Übersicht",
    icon: "pi pi-clipboard",
    route: routes.getOverviewPath(),
  },
  {
    label: "Dokumente",
    icon: "pi pi-file",
    route: routes.getDocumentListPath(),
  },
  {
    label: "Artikel",
    icon: "pi pi-list",
    route: routes.getArticleListPath(),
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
