<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createOrder, deleteOrder, getClients, getOrder, updateOrder } from "@/backendClient";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { OrderStatus } from "@/global/types/appTypes";
import type { OrderCreate, OrderUpdate } from "@/global/types/dataEditTypes";
import type { Client } from "@/global/types/entities";
import { debounce } from "@/helpers/utils";
import { ROUTES } from "@/router";

let orderInfo = ref<OrderUpdate | OrderCreate>({
  client_id: "",
  status: OrderStatus.preparation,
  title: "",
  description: "",
  discount_percentage: 0,
  discount_duration: 7,
  can_have_cash_discount: false,
});
// const id = "id";
const orderStatusTypes = Object.values(OrderStatus);
const discountChoice = [
  { value: true, label: "ja" },
  { value: false, label: "nein" },
];
const isEditing = computed(() => {
  return Boolean(route.params.id);
});
const discountPeriodChoice = [7, 14];

let selectedClient = ref<Client>();

const filteredClients = ref<Client[]>([]);
const clientsList = ref<Client[]>([]);

const getClientFullName = (client: Client) => {
  let full_name: string = "";

  if (client.first_name) full_name += client.first_name + " ";

  if (client.last_name) full_name += client.last_name;

  return full_name;
};

const isSaveButtonDisabled = computed(() => {
  return !(orderInfo.value.title && selectedClient.value?.id && orderInfo.value.description);
});

const searchClient = (event: any) => {
  debounce(() => {
    if (!event.query.trim().length) {
      filteredClients.value = [...clientsList.value];
    } else {
      filteredClients.value = clientsList.value.filter((client: Client) => {
        return (
          client.last_name?.toLowerCase().startsWith(event.query.toLowerCase()) ||
          client.first_name?.toLowerCase().startsWith(event.query.toLowerCase())
        );
      });
    }
  }, 250)();
};
const router = useRouter();
const route = useRoute();
function onOrdersList() {
  router.push(`${ROUTES.ORDER.path}`);
}
const confirm = useConfirmations();
const notifications = useNotifications();

const onSaveOrder = async () => {
  const payload: OrderCreate = orderInfo.value as OrderCreate;

  if (selectedClient.value) {
    payload.client_id = selectedClient.value.id;
  }
  if (isEditing.value) {
    await updateOrder(`${route.params.id}`, orderInfo.value);
    notifications.showUpdateOrderNotification();
  } else {
    await createOrder(payload);
    router.push(`${ROUTES.ORDER.path}`);
    notifications.showCreateOrderNotification();
  }
};

const removeOrder = async () => {
  await deleteOrder(`${route.params.id}`);
  router.push(`${ROUTES.ORDER.path}`);
  notifications.showDeleteOrderNotification();
};

const confirmDelete = () => {
  confirm.showDeleteOrderConfirmation(removeOrder);
};
const findClientById = () => {
  const foundClient = clientsList.value.find((client) => client.id === orderInfo.value.client_id);

  return foundClient;
};
onMounted(async () => {
  clientsList.value = (await getClients()).data;
  if (isEditing.value) {
    orderInfo.value = await getOrder(route.params.id as string);

    selectedClient.value = findClientById();
  }
});
</script>
<template>
  <form>
    <div class="flex flex-row justify-between mb-3">
      <Button
        @click="onOrdersList"
        icon="pi pi-arrow-left"
        size="small"
        severity="secondary"
        text
        raised
      />
      <Button
        @click="onSaveOrder"
        type="button"
        label="Auftrag Speichern"
        :disabled="isSaveButtonDisabled"
      ></Button>
      <Button
        v-if="isEditing"
        @click="confirmDelete"
        type="button"
        label="Löschen"
        severity="danger"
        text
        raised
      ></Button>
    </div>
    <Card>
      <template #content>
        <div class="flex flex-col gap-y-5">
          <p class="font-bold">Daten</p>
          <FloatLabel>
            <InputText id="order-title" v-model="orderInfo.title" class="w-full" />
            <label for="order-title">Bauvorhaben</label>
          </FloatLabel>
          <FloatLabel>
            <Dropdown
              v-model="orderInfo.status"
              :options="orderStatusTypes"
              class="w-full mt-3"
              id="select"
            />
            <label for="select" class="mt-3">Status</label>
          </FloatLabel>
          <p class="font-bold">Skonto</p>
          <div class="grid grid-cols-2 gap-1 mt-3">
            <FloatLabel>
              <Dropdown
                v-model="orderInfo.can_have_cash_discount"
                :options="discountChoice"
                class="w-full"
                id="select-discount"
                optionLabel="label"
                optionValue="value"
              />
              <label for="select-discount">Skontoberechtigt</label>
            </FloatLabel>
            <FloatLabel>
              <Dropdown
                v-model="orderInfo.discount_duration"
                :options="discountPeriodChoice"
                class="w-full"
                id="select"
              />
              <label for="select">Skontodauer</label>
            </FloatLabel>
          </div>
          <FloatLabel>
            <InputNumber id="percent" v-model="orderInfo.discount_percentage" class="w-full" />
            <label for="percent">Skonto(%)</label>
          </FloatLabel>

          <div>
            <label for="description" class="w-full font-bold my-3">Beschreibung</label>
            <Textarea v-model="orderInfo.description" rows="3" class="w-full" id="description" />
          </div>
          <div class="my-1">
            <p class="font-bold">Kunde</p>
            <AutoComplete
              v-model="selectedClient"
              :optionLabel="getClientFullName"
              :suggestions="filteredClients"
              @complete="searchClient"
              dropdown
            />
          </div>
        </div>
        <section>
          <OrderDocuments v-if="isEditing"></OrderDocuments>
        </section>
      </template>
    </Card>
  </form>
</template>
