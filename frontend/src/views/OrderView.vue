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

import { createOrder, getClients } from "@/backendClient";
import { OrderStatus } from "@/global/types/appTypes";
import type { OrderCreate, OrderUpdate } from "@/global/types/dataEditTypes";
import type { Client } from "@/global/types/entities";
import { ROUTES } from "@/router";

interface ExtendedClient extends Client {
  full_name?: string;
}
let orderInfo = ref<OrderUpdate | OrderCreate>({
  client_id: "",
  status: OrderStatus.preparation,
  title: "",
  description: "",
  discount_percentage: 0,
  discount_duration: 7,
  can_have_cash_discount: false,
});

const orderStatusTypes = Object.values(OrderStatus);
let status = ref(OrderStatus.preparation);

const discountChoice = [
  { value: true, label: "ja" },
  { value: false, label: "nein" },
];
let discount = ref(discountChoice[0]);
const isEditing = computed(() => {
  return Boolean(route.params.id);
});
const discountPeriodChoice = [7, 14];
let decription = ref<string>();

const selectedClient = ref<ExtendedClient>();

const filteredClients = ref<ExtendedClient[]>([]);
const clientsList = ref<ExtendedClient[]>([]);

const isButtonDisabled = computed(() => {
  if (orderInfo.value.title && selectedClient.value?.id && orderInfo.value.description) {
    return false;
  } else {
    return true;
  }
});

const searchClient = (event: any) => {
  setTimeout(() => {
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
  }, 250);
};
const router = useRouter();
const route = useRoute();
function onOrdersList() {
  router.push(`${ROUTES.ORDER.path}`);
}

const onSaveOrder = async () => {
  const payload: OrderCreate = orderInfo.value as OrderCreate;

  if (selectedClient.value) {
    payload.client_id = selectedClient.value.id;
  }
  const order = await createOrder(payload);
  router.push(`${ROUTES.ORDER.path}/${order.id}/edit`);
};

onMounted(async () => {
  clientsList.value = (await getClients()).data.map((client: Client) => {
    let full_name: string = "";

    if (client.first_name) full_name += client.first_name + " ";

    if (client.last_name) full_name += client.last_name;

    return {
      ...client,
      full_name,
    };
  });
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
        :disabled="isButtonDisabled"
      ></Button>
      <Button v-if="isEditing" type="button" label="Löschen" severity="danger" text raised></Button>
    </div>
    <Card>
      <template #content>
        <div class="flex flex-col gap-y-5">
          <p class="font-bold">Daten</p>
          <FloatLabel>
            <InputText id="constructionProject" v-model="orderInfo.title" class="w-full" />
            <label for="constructionProject">Bauvorhaben</label>
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
                id="selectDiscount"
                optionLabel="label"
                optionValue="value"
              />
              <label for="selectDiscount">Skontoberechtig</label>
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
              optionLabel="full_name"
              :suggestions="filteredClients"
              @complete="searchClient"
              dropdown
            />
          </div>
        </div>
      </template>
    </Card>
  </form>
</template>
