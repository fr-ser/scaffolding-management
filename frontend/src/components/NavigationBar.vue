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

<!--
The primevue menu causes error logs like these:
Blocked aria-hidden on a <a> element because the element that just received focus must not be hidden from assistive technology users

This seems in line with this issue:
https://github.com/primefaces/primevue/issues/6103
-->
<template>
  <Menubar :model="items">
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
