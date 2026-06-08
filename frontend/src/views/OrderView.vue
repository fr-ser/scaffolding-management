<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Card from "primevue/card";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createOrder, getClient, getClients, getOrder, updateOrder } from "@/backendClient";
import CreditNoteEdit from "@/components/orders/CreditNoteEdit.vue";
import InvoiceEdit from "@/components/orders/InvoiceEdit.vue";
import OfferEdit from "@/components/orders/OfferEdit.vue";
import OrderAttachments from "@/components/orders/OrderAttachments.vue";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import OverdueNoticeEdit from "@/components/orders/OverdueNoticeEdit.vue";
import useNotifications from "@/composables/useNotifications";
import useOrderLogic, { useOrderValidation } from "@/composables/useOrderLogic";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind, OrderStatus } from "@/global/types/appTypes";
import { UserPermissions } from "@/global/types/backendTypes";
import type { OrderCreate } from "@/global/types/dataEditTypes";
import type {
  Client,
  CreditNote,
  Invoice,
  Offer,
  Order,
  OverdueNotice,
} from "@/global/types/entities";
import { getOrderListPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";
import { useUserStore } from "@/store";
import { FrontendOrderStatusMap } from "@/types";

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

const orderInfo = ref<OrderCreate | Order>({
  client_id: "",
  status: OrderStatus.offer,
  title: "",
  description: "",
  discount_percentage: 0,
  discount_duration: 7,
  can_have_cash_discount: false,
});

const isLoading = ref<boolean>(true);

const discountChoice = [
  { value: true, label: "ja" },
  { value: false, label: "nein" },
];
const isEditing = computed(() => {
  return Boolean(route.params.id);
});
const discountPeriodChoice = [3, 7, 14];

const selectedClient = ref<Client>();

const filteredClients = ref<Client[]>([]);

const getClientLabel = (client: Client) => {
  let full_name: string = "";

  if (client.first_name) full_name += client.first_name + " ";

  if (client.last_name) full_name += client.last_name;
  if (client.company_name) full_name += " - " + client.company_name;

  return full_name;
};

const searchClient = (event: { query: string }) => {
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

const validation = useOrderValidation();
type SubOrder = Offer | Invoice | CreditNote | OverdueNotice | null;
type SubOrderTabData = {
  label: string;
  key: string;
  kind: DocumentKind;
  item: SubOrder;
};

// Above this count, group by document type so the tab row stays readable.
const directTabThreshold = 4;

const onSaveOrder = async () => {
  const payload = validation.validateAndCleanPayload({
    ...orderInfo.value,
    client_id: selectedClient.value?.id,
  });

  if (isEditing.value) {
    await updateOrder(`${route.params.id}`, payload);
    notifications.showNotification("Der Auftrag wurde gespeichert");
  } else {
    await createOrder(payload as OrderCreate);
    router.push(getOrderListPath());
    notifications.showNotification("Ein neuer Auftrag wurde erstellt");
  }
};

async function loadOrderData() {
  const newOrder = await getOrder(route.params.id as string);
  orderInfo.value = {
    ...newOrder,
    offers: newOrder.offers || [],
    invoices: newOrder.invoices || [],
    credit_notes: newOrder.credit_notes || [],
    overdue_notices: newOrder.overdue_notices || [],
  };
  showNewOfferTab.value = false;
  showNewInvoiceTab.value = false;
  showNewCreditNoteTab.value = false;
  showNewOverdueNoticeTab.value = false;

  if (route.query?.kind === DocumentKind.offer) {
    const id = parseInt(route.query?.subOrderId as string);
    setActiveSubOrder(DocumentKind.offer, getSubOrderKey(DocumentKind.offer, id));
  } else if (route.query?.kind === DocumentKind.invoice) {
    const id = parseInt(route.query?.subOrderId as string);
    setActiveSubOrder(DocumentKind.invoice, getSubOrderKey(DocumentKind.invoice, id));
  } else if (route.query?.kind === DocumentKind.overdueNotice) {
    const id = parseInt(route.query?.subOrderId as string);
    setActiveSubOrder(DocumentKind.overdueNotice, getSubOrderKey(DocumentKind.overdueNotice, id));
  } else if (route.query?.kind === DocumentKind.creditNote) {
    const id = parseInt(route.query?.subOrderId as string);
    setActiveSubOrder(DocumentKind.creditNote, getSubOrderKey(DocumentKind.creditNote, id));
  } else {
    activeTabKey.value = tabData.value[0]?.key || "";
    activeGroupKey.value = groupedTabData.value[0]?.kind || DocumentKind.offer;
  }
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

const activeTabKey = ref("");
const activeGroupKey = ref<DocumentKind>(DocumentKind.offer);
const selectedGroupedTabKeys = ref<Record<string, string>>({});

const showNewOfferTab = ref<boolean>(false);
function onClickCreateOffer() {
  showNewOfferTab.value = true;
  setActiveSubOrder(DocumentKind.offer, getNewSubOrderKey(DocumentKind.offer));
}
const showNewInvoiceTab = ref<boolean>(false);
function onClickCreateInvoice() {
  showNewInvoiceTab.value = true;
  setActiveSubOrder(DocumentKind.invoice, getNewSubOrderKey(DocumentKind.invoice));
}
const showNewCreditNoteTab = ref<boolean>(false);
function onClickCreateCreditNote() {
  showNewCreditNoteTab.value = true;
  setActiveSubOrder(DocumentKind.creditNote, getNewSubOrderKey(DocumentKind.creditNote));
}
const showNewOverdueNoticeTab = ref<boolean>(false);
function onClickCreateOverdueNotice() {
  showNewOverdueNoticeTab.value = true;
  setActiveSubOrder(DocumentKind.overdueNotice, getNewSubOrderKey(DocumentKind.overdueNotice));
}

function getSubOrderKey(kind: DocumentKind, id: number) {
  return `${kind}-${id}`;
}

function getNewSubOrderKey(kind: DocumentKind) {
  return `${kind}-new`;
}

function setActiveSubOrder(kind: DocumentKind, key: string) {
  activeTabKey.value = key;
  activeGroupKey.value = kind;
  selectedGroupedTabKeys.value = {
    ...selectedGroupedTabKeys.value,
    [kind]: key,
  };
}

async function onSubOrderSaved(kind: DocumentKind, id: number) {
  // Replace a newly-created placeholder tab with the persisted sub-order tab.
  if (kind === DocumentKind.offer) showNewOfferTab.value = false;
  else if (kind === DocumentKind.invoice) showNewInvoiceTab.value = false;
  else if (kind === DocumentKind.creditNote) showNewCreditNoteTab.value = false;
  else if (kind === DocumentKind.overdueNotice) showNewOverdueNoticeTab.value = false;

  await loadOrderData();
  setActiveSubOrder(kind, getSubOrderKey(kind, id));
}

async function onSubOrderDeleted() {
  await loadOrderData();
}

function getSelectedGroupedTab(kind: DocumentKind) {
  const tabs = tabDataByKind.value[kind] || [];
  return tabs.find((tab) => tab.key === selectedGroupedTabKeys.value[kind]) || tabs[0];
}

const tabDataByKind = computed<Record<DocumentKind, SubOrderTabData[]>>(() => {
  const tabs = {
    [DocumentKind.offer]: [] as SubOrderTabData[],
    [DocumentKind.invoice]: [] as SubOrderTabData[],
    [DocumentKind.creditNote]: [] as SubOrderTabData[],
    [DocumentKind.overdueNotice]: [] as SubOrderTabData[],
  };
  const typedOrder = orderInfo.value as Order;

  for (const element of typedOrder.offers || []) {
    tabs[DocumentKind.offer].push({
      label: `Angebot ${formatIsoDateString(element.offered_at)}`,
      key: getSubOrderKey(DocumentKind.offer, element.id),
      kind: DocumentKind.offer,
      item: element,
    });
  }

  if (showNewOfferTab.value) {
    tabs[DocumentKind.offer].push({
      label: "Neues Angebot",
      key: getNewSubOrderKey(DocumentKind.offer),
      kind: DocumentKind.offer,
      item: null,
    });
  }

  for (const element of typedOrder.invoices || []) {
    tabs[DocumentKind.invoice].push({
      label: `Rechnung ${formatIsoDateString(element.invoice_date)}`,
      key: getSubOrderKey(DocumentKind.invoice, element.id),
      kind: DocumentKind.invoice,
      item: element,
    });
  }

  if (showNewInvoiceTab.value) {
    tabs[DocumentKind.invoice].push({
      label: "Neue Rechnung",
      key: getNewSubOrderKey(DocumentKind.invoice),
      kind: DocumentKind.invoice,
      item: null,
    });
  }

  for (const element of typedOrder.credit_notes || []) {
    tabs[DocumentKind.creditNote].push({
      label: `Gutschrift ${formatIsoDateString(element.credit_date)}`,
      key: getSubOrderKey(DocumentKind.creditNote, element.id),
      kind: DocumentKind.creditNote,
      item: element,
    });
  }

  if (showNewCreditNoteTab.value) {
    tabs[DocumentKind.creditNote].push({
      label: "Neue Gutschrift",
      key: getNewSubOrderKey(DocumentKind.creditNote),
      kind: DocumentKind.creditNote,
      item: null,
    });
  }

  for (const element of typedOrder.overdue_notices || []) {
    tabs[DocumentKind.overdueNotice].push({
      label: `Mahnung ${formatIsoDateString(element.notice_date)}`,
      key: getSubOrderKey(DocumentKind.overdueNotice, element.id),
      kind: DocumentKind.overdueNotice,
      item: element,
    });
  }

  if (showNewOverdueNoticeTab.value) {
    tabs[DocumentKind.overdueNotice].push({
      label: "Neue Mahnung",
      key: getNewSubOrderKey(DocumentKind.overdueNotice),
      kind: DocumentKind.overdueNotice,
      item: null,
    });
  }

  return tabs;
});

const tabData = computed(() => Object.values(tabDataByKind.value).flat());

const shouldUseGroupedTabs = computed(() => tabData.value.length > directTabThreshold);

const groupedTabData = computed(() =>
  [
    { kind: DocumentKind.offer, label: "Angebote", tabs: tabDataByKind.value[DocumentKind.offer] },
    {
      kind: DocumentKind.invoice,
      label: "Rechnungen",
      tabs: tabDataByKind.value[DocumentKind.invoice],
    },
    {
      kind: DocumentKind.creditNote,
      label: "Gutschriften",
      tabs: tabDataByKind.value[DocumentKind.creditNote],
    },
    {
      kind: DocumentKind.overdueNotice,
      label: "Mahnungen",
      tabs: tabDataByKind.value[DocumentKind.overdueNotice],
    },
  ].filter((group) => group.tabs.length > 0),
);
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
              <Select
                v-model="orderInfo.status"
                optionLabel="value"
                optionValue="key"
                :options="
                  Object.entries(FrontendOrderStatusMap).map(([key, value]) => ({ key, value }))
                "
                class="min-w-32"
                id="order-status"
              />
              <label for="order-status">Status</label>
            </FloatLabel>
          </div>
          <p class="font-bold">Skonto</p>
          <div class="flex flex-row flex-wrap justify-between gap-6 mt-3">
            <FloatLabel>
              <Select
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
              <Select
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
                :inputProps="{ inputmode: 'decimal' }"
              />
              <!-- inputmode: decimal is required to show comma/dot on a mobile iOS keyboard -->
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

    <Card class="mt-2" v-if="isEditing">
      <template #content>
        <div class="flex flex-col gap-y-5">
          <div v-if="isEditing && userStore.permissions.includes(UserPermissions.SUB_ORDERS_EDIT)">
            <p class="font-bold mb-2">Unteraufträge</p>
            <div class="flex flex-row flex-wrap gap-2">
              <Button label="Angebot erstellen" @click="onClickCreateOffer" />
              <Button label="Rechnung erstellen" @click="onClickCreateInvoice" />
              <Button label="Gutschrift erstellen" @click="onClickCreateCreditNote" />
              <Button label="Mahnung erstellen" @click="onClickCreateOverdueNotice" />
            </div>
            <Tabs
              v-if="
                userStore.permissions.includes(UserPermissions.SUB_ORDERS_VIEW) &&
                tabData.length > 0 &&
                !shouldUseGroupedTabs
              "
              v-model:value="activeTabKey"
            >
              <TabList>
                <Tab v-for="tab in tabData" :key="tab.key" :value="tab.key">{{ tab.label }}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel v-for="tab in tabData" :key="tab.key" :value="tab.key">
                  <OfferEdit
                    v-if="tab.kind === DocumentKind.offer"
                    @deleted="onSubOrderDeleted"
                    @saved="(id) => onSubOrderSaved(DocumentKind.offer, id)"
                    :order="orderInfo as Order"
                    :existing-offer="tab.item as Offer"
                  />
                  <InvoiceEdit
                    v-else-if="tab.kind === DocumentKind.invoice"
                    @deleted="onSubOrderDeleted"
                    @saved="(id) => onSubOrderSaved(DocumentKind.invoice, id)"
                    :order="orderInfo as Order"
                    :existing-invoice="tab.item as Invoice"
                  />
                  <CreditNoteEdit
                    v-else-if="tab.kind === DocumentKind.creditNote"
                    @deleted="onSubOrderDeleted"
                    @saved="(id) => onSubOrderSaved(DocumentKind.creditNote, id)"
                    :order="orderInfo as Order"
                    :existing-credit-note="tab.item as CreditNote"
                  />
                  <OverdueNoticeEdit
                    v-else-if="tab.kind === DocumentKind.overdueNotice"
                    @deleted="onSubOrderDeleted"
                    @saved="(id) => onSubOrderSaved(DocumentKind.overdueNotice, id)"
                    :order="orderInfo as Order"
                    :existing-overdue-notice="tab.item as OverdueNotice"
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Tabs
              v-else-if="
                userStore.permissions.includes(UserPermissions.SUB_ORDERS_VIEW) &&
                tabData.length > 0
              "
              v-model:value="activeGroupKey"
            >
              <TabList>
                <Tab v-for="group in groupedTabData" :key="group.kind" :value="group.kind">
                  {{ group.label }} ({{ group.tabs.length }})
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel v-for="group in groupedTabData" :key="group.kind" :value="group.kind">
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-row flex-wrap gap-2">
                      <Button
                        v-for="tab in group.tabs"
                        :key="tab.key"
                        @click="setActiveSubOrder(tab.kind, tab.key)"
                        :label="tab.label"
                        :severity="
                          getSelectedGroupedTab(group.kind)?.key === tab.key
                            ? undefined
                            : 'secondary'
                        "
                        :outlined="getSelectedGroupedTab(group.kind)?.key !== tab.key"
                        class="justify-start text-left"
                        size="small"
                      />
                    </div>
                    <div class="min-w-0 grow">
                      <OfferEdit
                        v-if="getSelectedGroupedTab(group.kind)?.kind === DocumentKind.offer"
                        :key="`offer-editor-${getSelectedGroupedTab(group.kind)?.key}`"
                        @deleted="onSubOrderDeleted"
                        @saved="(id) => onSubOrderSaved(DocumentKind.offer, id)"
                        :order="orderInfo as Order"
                        :existing-offer="getSelectedGroupedTab(group.kind)?.item as Offer"
                      />
                      <InvoiceEdit
                        v-else-if="getSelectedGroupedTab(group.kind)?.kind === DocumentKind.invoice"
                        :key="`invoice-editor-${getSelectedGroupedTab(group.kind)?.key}`"
                        @deleted="onSubOrderDeleted"
                        @saved="(id) => onSubOrderSaved(DocumentKind.invoice, id)"
                        :order="orderInfo as Order"
                        :existing-invoice="getSelectedGroupedTab(group.kind)?.item as Invoice"
                      />
                      <CreditNoteEdit
                        v-else-if="
                          getSelectedGroupedTab(group.kind)?.kind === DocumentKind.creditNote
                        "
                        :key="`credit-note-editor-${getSelectedGroupedTab(group.kind)?.key}`"
                        @deleted="onSubOrderDeleted"
                        @saved="(id) => onSubOrderSaved(DocumentKind.creditNote, id)"
                        :order="orderInfo as Order"
                        :existing-credit-note="
                          getSelectedGroupedTab(group.kind)?.item as CreditNote
                        "
                      />
                      <OverdueNoticeEdit
                        v-else-if="
                          getSelectedGroupedTab(group.kind)?.kind === DocumentKind.overdueNotice
                        "
                        :key="`overdue-notice-editor-${getSelectedGroupedTab(group.kind)?.key}`"
                        @deleted="onSubOrderDeleted"
                        @saved="(id) => onSubOrderSaved(DocumentKind.overdueNotice, id)"
                        :order="orderInfo as Order"
                        :existing-overdue-notice="
                          getSelectedGroupedTab(group.kind)?.item as OverdueNotice
                        "
                      />
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </template>
    </Card>

    <Card class="mt-2" v-if="isEditing">
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
