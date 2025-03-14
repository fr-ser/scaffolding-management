<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createOrder, deleteOrder, getClients, getOrder, updateOrder } from "@/backendClient";
import InvoiceSummary from "@/components/orders/InvoiceSummary.vue";
import OfferSummary from "@/components/orders/OfferSummary.vue";
import OrderAttachments from "@/components/orders/OrderAttachments.vue";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import OverdueSummary from "@/components/orders/OverdueNoticeSummary.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind, OrderStatus, SubItemKind } from "@/global/types/appTypes";
import { UserPermissions } from "@/global/types/backendTypes";
import type { OrderCreate } from "@/global/types/dataEditTypes";
import type { Client, Offer, Order } from "@/global/types/entities";
import { getOrderListPath, getOrderSubOrderCreatePath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";
import { useUserStore } from "@/store";

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let orderInfo = ref<OrderCreate | Order>({
  client_id: "",
  status: OrderStatus.preparation,
  title: "",
  description: "",
  discount_percentage: 0,
  discount_duration: 7,
  can_have_cash_discount: false,
});

let isLoading = ref<boolean>(true);

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
    router.push(getOrderListPath());
    notifications.showCreateOrderNotification();
  }
};

const removeOrder = async () => {
  await deleteOrder(`${route.params.id}`);
  router.push(getOrderListPath());
  notifications.showDeleteOrderNotification();
};

const confirmDelete = () => {
  confirm.showDeleteOrderConfirmation(removeOrder);
};

const findClientById = () => {
  const foundClient = clientsList.value.find((client) => client.id === orderInfo.value.client_id);

  return foundClient;
};

const subItemsIds = computed(() => {
  const result = [];

  if ((orderInfo.value as Order).offer) {
    result.push({
      type: SubItemKind.offer,
      id: (orderInfo.value as Order).offer?.id,
    });
  }

  if ((orderInfo.value as Order).invoices?.length) {
    (orderInfo.value as Order).invoices?.forEach((invoice) => {
      result.push({
        type: SubItemKind.invoice,
        id: invoice.id,
      });
    });
  }

  if ((orderInfo.value as Order).overdue_notices?.length) {
    (orderInfo.value as Order).overdue_notices?.forEach((overdue) => {
      result.push({
        type: SubItemKind.overdueNotice,
        id: overdue.id,
      });
    });
  }

  return result;
});

const getActiveSubOrderIndex = () => {
  const { sub_id, sub_type } = route.query;
  const index = subItemsIds.value.findIndex((item) => {
    return item.id === Number(sub_id) && item.type === sub_type;
  });
  return index !== -1 ? index : 0;
};

onMounted(async () => {
  clientsList.value = (await getClients()).data;

  if (isEditing.value) {
    orderInfo.value = await getOrder(route.params.id as string);
    selectedClient.value = findClientById();
  }

  isLoading.value = false;
});
</script>
<template>
  <div v-if="isLoading" class="flex justify-center">
    <ProgressSpinner />
  </div>
  <form v-else>
    <div class="flex flex-row justify-between mb-3">
      <Button
        @click="router.push(getOrderListPath())"
        icon="pi pi-arrow-left"
        size="small"
        severity="secondary"
        text
        raised
        data-testid="order-return-button"
      />
      <Button
        v-if="userStore.permissions.includes(UserPermissions.ORDERS_UPDATE)"
        @click="onSaveOrder"
        type="button"
        label="Auftrag Speichern"
        :disabled="isSaveButtonDisabled"
        data-testid="order-save-button"
      />
      <Button
        v-if="userStore.permissions.includes(UserPermissions.ORDERS_CREATE_DELETE) && isEditing"
        @click="confirmDelete"
        type="button"
        label="Löschen"
        severity="danger"
        text
        raised
      />
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
          <div class="my-1 w-full flex flex-col">
            <p class="font-bold">Kunde</p>
            <AutoComplete
              v-model="selectedClient"
              :optionLabel="getClientFullName"
              :suggestions="filteredClients"
              @complete="searchClient"
              dropdown
              :inputStyle="{ width: '100%' }"
              data-testid="order-client-select"
              :pt="{
                // fixes https://github.com/primefaces/primevue/issues/6141
                // and https://github.com/primefaces/primevue/issues/6103
                dropdownButton: {
                  root: {
                    ariaHidden: false,
                  },
                },
              }"
            />
          </div>
          <div v-if="isEditing && userStore.permissions.includes(UserPermissions.SUB_ORDERS_EDIT)">
            <p class="font-bold mb-2">Unteraufträge</p>
            <div class="flex flex-col gap-2">
              <router-link
                :to="getOrderSubOrderCreatePath(route.params.id as string, DocumentKind.offer)"
              >
                <Button v-if="!(orderInfo as Order).offer" label="Angebot erstellen" />
              </router-link>
              <router-link
                :to="getOrderSubOrderCreatePath(route.params.id as string, DocumentKind.invoice)"
              >
                <Button label="Rechnung erstellen" />
              </router-link>
              <router-link
                :to="
                  getOrderSubOrderCreatePath(route.params.id as string, DocumentKind.overdueNotice)
                "
              >
                <Button label="Mahnung erstellen" />
              </router-link>
            </div>
          </div>
          <section v-if="userStore.permissions.includes(UserPermissions.SUB_ORDERS_VIEW)">
            <TabView :active-index="getActiveSubOrderIndex()">
              <TabPanel v-if="(orderInfo as Order).offer" header="Angebot">
                <OfferSummary :offer="(orderInfo as Order).offer as Offer"></OfferSummary>
              </TabPanel>
              <TabPanel
                v-for="item in (orderInfo as Order).invoices"
                :key="item.id"
                :header="`Rechnung ${formatIsoDateString(item.invoice_date)}`"
              >
                <InvoiceSummary :invoice="item"> </InvoiceSummary>
              </TabPanel>
              <TabPanel
                v-for="item in (orderInfo as Order).overdue_notices"
                :key="item.id"
                :header="`Mahnung ${formatIsoDateString(item.notice_date)}`"
              >
                <OverdueSummary :overdue="item"></OverdueSummary>
              </TabPanel>
            </TabView>
          </section>
        </div>
        <OrderDocuments
          v-if="isEditing && userStore.permissions.includes(UserPermissions.DOCUMENTS_VIEW)"
          :id="(orderInfo as Order).id"
        />
        <OrderAttachments v-if="isEditing" :order-id="(orderInfo as Order).id" />
      </template>
    </Card>
  </form>
</template>
