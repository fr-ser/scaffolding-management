<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { ref } from "vue";

import { ROUTES } from "@/router";

const ordersList = ref([
  { id: 1, name: "Order 1" },
  { id: 2, name: "Order 2" },
  { id: 3, name: "Order 3" },
  { id: 4, name: "Order 4" },
  { id: 2, name: "Order 5" },
  { id: 3, name: "Order 6" },
  { id: 4, name: "Order 7" },
]);
let value = ref();
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="value" placeholder="Suche" class="pl-10 w-full" />
      </span>
      <router-link :to="`${ROUTES.ORDER.path}/new`">
        <Button icon="pi pi-plus" rounded aria-label="Filter" />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <Card class="my-2" v-for="order in ordersList" :key="order.id">
        <template #content>
          <div class="flex flex-row justify-between items-center">
            <div>
              {{ order.name }}
            </div>
            <div class="flex flex-col gap-y-2">
              <router-link :to="`${ROUTES.ORDER.path}/:id`">
                <Button
                  label="Bearbeiten"
                  icon="pi pi-pencil"
                  severity="secondary"
                  outlined
                  size="small"
                />
              </router-link>
              <Button label="Löschen" icon="pi pi-times" severity="danger" size="small" />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
