<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { onMounted, ref } from "vue";

import { deleteOrder, getOrders } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import type { Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

const ordersList = ref<Order[]>([]);
async function reloadPage() {
  ordersList.value = (await getOrders()).data;
}
let value = ref();

const confirm = useConfirmations();
const notifications = useNotifications();

async function removeOrder(order: Order) {
  await deleteOrder(order.id);
  reloadPage();
  notifications.showDeleteOrderNotification();
}
const confirmDelete = (order: Order) => {
  confirm.showDeleteOrderConfirmation(async () => {
    removeOrder(order);
  });
};
onMounted(async () => {
  reloadPage();
});
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
        <Button icon="pi pi-plus" rounded aria-label="Neuen Auftrag anlegen" />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <router-link
        :to="`${ROUTES.ORDER.path}/${order.id}/edit`"
        v-for="order in ordersList"
        :key="order.id"
      >
        <Card class="my-2">
          <template #content>
            <div class="flex flex-row justify-between items-center">
              <div>
                {{ `${order.id} ${order.title}` }}
              </div>
              <div class="flex flex-col gap-y-2">
                <router-link :to="`${ROUTES.ORDER.path}/${order.id}/edit`">
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
                />
              </div>
            </div>
          </template>
        </Card>
      </router-link>
    </div>
  </div>
</template>
