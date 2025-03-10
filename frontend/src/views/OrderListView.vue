<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { onMounted, ref, watch } from "vue";

import { deleteOrder, getOrders } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import type { Order } from "@/global/types/entities";
import { getOrderCreatePath, getOrderEditPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";

const ordersList = ref<Order[]>([]);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(true);

async function loadData() {
  const response = await getOrders({ search: search.value, take: take.value });
  ordersList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

const confirm = useConfirmations();
const notifications = useNotifications();

async function removeOrder(order: Order) {
  await deleteOrder(order.id);
  loadData();
  notifications.showDeleteOrderNotification();
}
const confirmDelete = (order: Order) => {
  confirm.showDeleteOrderConfirmation(async () => {
    removeOrder(order);
  });
};

watch(search, debounce(loadData, 250));

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
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
      <router-link :to="getOrderCreatePath()">
        <Button
          label="Auftrag anlegen"
          rounded
          aria-label="Neuen Auftrag anlegen"
          data-testid="order-create-button"
        />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <router-link :to="getOrderEditPath(order.id)" v-for="order in ordersList" :key="order.id">
        <Card class="my-2" data-testid="order-card">
          <template #content>
            <div class="flex flex-row justify-between items-center">
              <div>
                {{ `${order.id} ${order.title}` }}
              </div>
              <div class="flex flex-col gap-y-2">
                <router-link :to="getOrderEditPath(order.id)">
                  <Button
                    label="Bearbeiten"
                    icon="pi pi-pencil"
                    severity="secondary"
                    outlined
                    size="small"
                  />
                </router-link>
                <Button
                  @click.stop.prevent="confirmDelete(order)"
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
      </router-link>
      <div class="flex justify-center">
        <Button v-if="hasMore" @click="loadMore">Weitere Aufträge laden</Button>
      </div>
    </div>
  </div>
</template>
