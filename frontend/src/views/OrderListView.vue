<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { computed, onMounted, ref, watch } from "vue";

import { getOrders } from "@/backendClient";
import useOrderLogic from "@/composables/useOrderLogic";
import { UserPermissions } from "@/global/types/backendTypes";
import type { Order } from "@/global/types/entities";
import { getOrderCreatePath, getOrderEditPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";
import { useUserStore } from "@/store";

const userStore = useUserStore();
const { deleteOrderWithConfirmation } = useOrderLogic();

const editButtonText = computed(() => {
  return userStore.permissions.includes(UserPermissions.ORDERS_UPDATE)
    ? "Anschauen / Bearbeiten"
    : "Anschauen";
});

const ordersList = ref<Order[]>([]);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(false);

async function loadData() {
  const response = await getOrders({ search: search.value, take: take.value });
  ordersList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

async function onClickDeleteOrder(order: Order) {
  const success = await deleteOrderWithConfirmation(order.id);
  if (success) {
    loadData();
  }
}

watch(search, debounce(loadData, 250));

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="flex w-full gap-x-6 mb-3">
      <span class="relative grow flex flex-row items-center">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText
          v-model="search"
          placeholder="Suche (ID oder Bauvorhaben)"
          class="pl-10 w-full"
          data-testid="order-search-input"
        />
      </span>
      <router-link
        v-if="userStore.permissions.includes(UserPermissions.ORDERS_CREATE_DELETE)"
        :to="getOrderCreatePath()"
      >
        <Button
          label="Auftrag anlegen"
          rounded
          aria-label="Neuen Auftrag anlegen"
          data-testid="order-create-button"
        />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <Card v-for="order in ordersList" :key="order.id" class="mt-2" data-testid="order-card">
        <template #content>
          <div class="flex flex-row justify-between items-center">
            <div>
              {{ `${order.id} ${order.title}` }}
            </div>
            <div class="flex flex-row flex-wrap gap-2">
              <router-link :to="getOrderEditPath(order.id)">
                <Button
                  :label="editButtonText"
                  icon="pi pi-pencil"
                  severity="secondary"
                  outlined
                  size="small"
                />
              </router-link>
              <Button
                v-if="userStore.permissions.includes(UserPermissions.ORDERS_CREATE_DELETE)"
                @click="onClickDeleteOrder(order)"
                label="Löschen"
                icon="pi pi-times"
                severity="danger"
                size="small"
                data-testid="order-delete-button"
              />
            </div>
          </div>
        </template>
      </Card>
      <div class="mt-2 flex justify-center">
        <Button v-if="hasMore" @click="loadMore">Weitere Aufträge laden</Button>
      </div>
    </div>
  </div>
</template>
