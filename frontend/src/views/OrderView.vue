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

import { createOrder, getClient, getClients, getOrder, updateOrder } from "@/backendClient";
import InvoiceEdit from "@/components/orders/InvoiceEdit.vue";
import OfferEdit from "@/components/orders/OfferEdit.vue";
import OrderAttachments from "@/components/orders/OrderAttachments.vue";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import OverdueNoticeEdit from "@/components/orders/OverdueNoticeEdit.vue";
import useNotifications from "@/compositions/useNotifications";
import useOrderLogic from "@/compositions/useOrderLogic";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind, OrderStatus } from "@/global/types/appTypes";
import { UserPermissions } from "@/global/types/backendTypes";
import type { OrderCreate } from "@/global/types/dataEditTypes";
import type { Client, Invoice, Order, OverdueNotice } from "@/global/types/entities";
import { getOrderListPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";
import { useUserStore } from "@/store";

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let orderInfo = ref<OrderCreate | Order>({
  client_id: "",
  status: OrderStatus.offer,
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

const getClientLabel = (client: Client) => {
  let full_name: string = "";

  if (client.first_name) full_name += client.first_name + " ";

  if (client.last_name) full_name += client.last_name;
  if (client.company_name) full_name += " - " + client.company_name;

  return full_name;
};

const isSaveButtonDisabled = computed(() => {
  return !(orderInfo.value.title && selectedClient.value?.id);
});

const searchClient = (event: any) => {
  debounce(async () => {
    if (!event.query.trim().length) {
      // we update the list to allow showing all clients when clicking the dropdown
      filteredClients.value = [...filteredClients.value];
      return;
    }

    filteredClients.value = (await getClients({ search: event.query.trim() })).data;
  }, 250)();
};
const notifications = useNotifications();
const { deleteOrderWithConfirmation } = useOrderLogic();

const onSaveOrder = async () => {
  const payload: OrderCreate = orderInfo.value as OrderCreate;

  if (selectedClient.value) {
    payload.client_id = selectedClient.value.id;
  }
  if (isEditing.value) {
    await updateOrder(`${route.params.id}`, orderInfo.value);
    notifications.showNotification("Der Auftrag wurde gespeichert");
  } else {
    await createOrder(payload);
    router.push(getOrderListPath());
    notifications.showNotification("Ein neuer Auftrag wurde erstellt");
  }
};

async function loadOrderData() {
  const newOrder = await getOrder(route.params.id as string);
  orderInfo.value = newOrder;
  showOfferTab.value = Boolean(newOrder.offer);

  if (route.query?.kind === DocumentKind.invoice) {
    const id = parseInt(route.query?.subOrderId as string);

    activeTabIndex.value =
      1 + (newOrder.invoices as Invoice[]).findIndex((item) => item.id === id) || 0;
  } else if (route.query?.kind === DocumentKind.overdueNotice) {
    const id = parseInt(route.query?.subOrderId as string);
    const invoiceLength = newOrder?.invoices?.length || 0;

    activeTabIndex.value =
      invoiceLength +
        1 +
        (newOrder.overdue_notices as OverdueNotice[]).findIndex((item) => item.id === id) || 0;
  }
  //if the query is "offer" we show the default tab
}

async function onClickDeleteOrder() {
  const success = await deleteOrderWithConfirmation(route.params.id as string);
  if (success) {
    router.push(getOrderListPath());
  }
}

onMounted(async () => {
  if (isEditing.value) {
    await loadOrderData();
    selectedClient.value = await getClient(orderInfo.value.client_id);
  } else {
    filteredClients.value = (await getClients()).data;
  }

  isLoading.value = false;
});

const activeTabIndex = ref(0);

let showOfferTab = ref<boolean>(false);
function onClickCreateOffer() {
  showOfferTab.value = true;
}
let showNewInvoiceTab = ref<boolean>(false);
function onClickCreateInvoice() {
  showNewInvoiceTab.value = true;
}
let showNewOverdueNoticeTab = ref<boolean>(false);
function onClickCreateOverdueNotice() {
  showNewOverdueNoticeTab.value = true;
}
</script>

<template>
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
      @click="onClickDeleteOrder"
      type="button"
      label="Löschen"
      severity="danger"
      text
      raised
    />
  </div>
  <div v-if="isLoading" class="flex justify-center">
    <ProgressSpinner />
  </div>
  <div v-else>
    <Card>
      <template #content>
        <div class="flex flex-col gap-y-5">
          <p class="font-bold">Daten</p>
          <div class="flex flex-row flex-wrap gap-6">
            <FloatLabel class="grow">
              <InputText id="order-title" v-model="orderInfo.title" class="w-full" />
              <label for="order-title">Bauvorhaben</label>
            </FloatLabel>
            <FloatLabel>
              <Dropdown
                v-model="orderInfo.status"
                :options="orderStatusTypes"
                class="min-w-32"
                id="order-status"
              />
              <label for="order-status">Status</label>
            </FloatLabel>
          </div>
          <p class="font-bold">Skonto</p>
          <div class="flex flex-row flex-wrap justify-between gap-6 mt-3">
            <FloatLabel>
              <Dropdown
                v-model="orderInfo.can_have_cash_discount"
                :options="discountChoice"
                class="min-w-48"
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
                class="min-w-48"
                id="select"
              />
              <label for="select">Skontodauer</label>
            </FloatLabel>
            <FloatLabel>
              <InputNumber
                id="percent"
                v-model="orderInfo.discount_percentage"
                locale="de-DE"
                :minFractionDigits="0"
                :maxFractionDigits="10"
                class="w-full"
              />
              <label for="percent">Skonto(%)</label>
            </FloatLabel>
          </div>

          <div>
            <label for="description" class="w-full font-bold my-3">Beschreibung</label>
            <Textarea v-model="orderInfo.description" rows="3" class="w-full" id="description" />
          </div>
          <div class="my-1 w-full flex flex-col">
            <p class="font-bold">Kunde</p>
            <AutoComplete
              v-model="selectedClient"
              :optionLabel="getClientLabel"
              @complete="searchClient"
              :suggestions="filteredClients"
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
        </div>
      </template>
    </Card>

    <Card class="mt-2">
      <template #content>
        <div class="flex flex-col gap-y-5">
          <div v-if="isEditing && userStore.permissions.includes(UserPermissions.SUB_ORDERS_EDIT)">
            <p class="font-bold mb-2">Unteraufträge</p>
            <div class="flex flex-row gap-2">
              <Button
                v-if="(orderInfo as Order).offer == null"
                label="Angebot erstellen"
                @click="onClickCreateOffer"
              />
              <Button label="Rechnung erstellen" @click="onClickCreateInvoice" />
              <Button label="Mahnung erstellen" @click="onClickCreateOverdueNotice" />
            </div>
            <TabView
              v-if="userStore.permissions.includes(UserPermissions.SUB_ORDERS_VIEW)"
              :active-index="activeTabIndex"
            >
              <TabPanel v-if="showOfferTab" header="Angebot">
                <OfferEdit
                  @deleted="loadOrderData"
                  :order="orderInfo as Order"
                  :existing-offer="(orderInfo as Order).offer"
                />
              </TabPanel>
              <TabPanel
                v-for="item in (orderInfo as Order).invoices"
                :key="item.id"
                :header="`Rechnung ${formatIsoDateString(item.invoice_date)}`"
              >
                <InvoiceEdit
                  @deleted="loadOrderData"
                  :order="orderInfo as Order"
                  :existing-invoice="item"
                />
              </TabPanel>
              <TabPanel v-if="showNewInvoiceTab" header="Neue Rechnung">
                <InvoiceEdit @deleted="loadOrderData" :order="orderInfo as Order" />
              </TabPanel>
              <TabPanel
                v-for="item in (orderInfo as Order).overdue_notices"
                :key="item.id"
                :header="`Mahnung ${formatIsoDateString(item.notice_date)}`"
              >
                <OverdueNoticeEdit
                  @deleted="loadOrderData"
                  :order="orderInfo as Order"
                  :existing-overdue-notice="item"
                />
              </TabPanel>
              <TabPanel v-if="showNewOverdueNoticeTab" header="Neue Mahnung">
                <OverdueNoticeEdit @deleted="loadOrderData" :order="orderInfo as Order" />
              </TabPanel>
            </TabView>
          </div>
        </div>
      </template>
    </Card>

    <Card class="mt-2">
      <template #content>
        <OrderDocuments
          v-if="isEditing && userStore.permissions.includes(UserPermissions.DOCUMENTS_VIEW)"
          :id="(orderInfo as Order).id"
        />
        <OrderAttachments v-if="isEditing" :order-id="(orderInfo as Order).id" />
      </template>
    </Card>
  </div>
</template>
