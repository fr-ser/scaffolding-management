<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import SplitButton from "primevue/splitbutton";
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createInvoice, getOrder } from "@/backendClient";
import OrderSummary from "@/components/orders/OrderSummary.vue";
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import useNotifications from "@/compositions/useNotifications";
import { ArticleKind, PaymentStatus } from "@/global/types/appTypes";
import type { InvoiceCreate, InvoiceItemCreate } from "@/global/types/dataEditTypes";
import type { Order } from "@/global/types/entities";
import { getOrderEditPath } from "@/helpers/routes";
import { calculateItemSumPrice, formatDateToIsoString } from "@/helpers/utils";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const notifications = useNotifications();

let itemCount = 1;
let calendarCount = 1;

let invoiceItemsArray = ref<InvoiceItemCreate[]>([]);

let invoiceInfo = ref<InvoiceCreate>({
  order_id: "",
  status: PaymentStatus.initial,
  description: "",
  invoice_date: "",
  payment_target: "",
  items: [],
  service_dates: [],
  sub_id: "",
});

let orderInfo = ref<Order | undefined>();
const invoiceType = Object.values(PaymentStatus);
let invoiceDate = ref<Date>();
let paymentTarget = ref<Date>();
let serviceDates = ref<{ id: number; date?: Date }[]>([{ id: 0 }]);

const items = [
  {
    label: "Hinweis hinzufügen",
    command: () => {
      onItemCreate(ArticleKind.heading);
      toast.add({ severity: "success", detail: "Hinweis hinzugefügt", life: 3000 });
    },
  },
  {
    label: "Position hinzufügen",
    command: () => {
      onItemCreate(ArticleKind.item),
        toast.add({ severity: "success", detail: "Position hinzugefügt", life: 3000 });
    },
  },
];

function onServiceDateCreate() {
  serviceDates.value.push({ id: calendarCount++ });
}

function onItemDelete(id: number) {
  invoiceItemsArray.value = invoiceItemsArray.value.filter((element) => element.id !== id);
}

function onItemUpdate(item: InvoiceItemCreate) {
  invoiceItemsArray.value = invoiceItemsArray.value.map((element) => {
    if (element.id === item.id) {
      return item;
    } else {
      return element;
    }
  });
}

function onItemCreate(kind: ArticleKind) {
  invoiceItemsArray.value.push({ id: itemCount++, kind, title: "", description: "" });
}
function onServiceDateDelete(id: number) {
  serviceDates.value = serviceDates.value.filter((element) => element.id !== id);
}
const allItemsSum = computed(() => {
  return calculateItemSumPrice(invoiceItemsArray.value, invoiceInfo.value.invoice_date);
});

async function onCreateInvoice() {
  await createInvoice({
    ...invoiceInfo.value,
    items: invoiceItemsArray.value,
    service_dates: serviceDates.value
      .filter((item) => Boolean(item.date))
      .map((element) => formatDateToIsoString(element.date as Date)),
  });
  router.push(getOrderEditPath(route.params.orderId as string));
  notifications.showCreateInvoiceNotification();
}

watch(invoiceDate, () => {
  if (invoiceDate.value) {
    invoiceInfo.value.invoice_date = formatDateToIsoString(invoiceDate.value);
  } else {
    invoiceInfo.value.invoice_date = "";
  }
});

watch(paymentTarget, () => {
  if (paymentTarget.value) {
    invoiceInfo.value.payment_target = formatDateToIsoString(paymentTarget.value);
  } else {
    invoiceInfo.value.payment_target = "";
  }
});

onMounted(async () => {
  orderInfo.value = await getOrder(route.params.orderId as string);
  invoiceInfo.value.order_id = orderInfo.value.id;
});
</script>
<template>
  <div v-if="orderInfo">
    <div class="flex flex-row justify-between">
      <router-link :to="getOrderEditPath(route.params.orderId as string)">
        <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
      </router-link>
      <div class="flex gap-x-2">
        <Button @click="onCreateInvoice" label="Speichern" text raised />
        <!-- TODO: add removal -->
        <!-- <Button label="Löschen" severity="danger" text raised /> -->
      </div>
    </div>
    <OrderSummary :order-info="orderInfo" />
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Rechnung:</div>
        <section
          class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center"
        >
          <FloatLabel class="my-6">
            <Calendar
              id="invoice-date-input"
              v-model="invoiceDate"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar"> Rechnungsdatum </label>
          </FloatLabel>
          <FloatLabel class="my-6">
            <Calendar
              id="payment-target-input"
              v-model="paymentTarget"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar"> Zalungsziel </label>
          </FloatLabel>
          <!-- <div class="mb-2">Zahlungstatus:</div> -->
          <FloatLabel>
            <Dropdown
              id="invoice-info-status"
              v-model="invoiceInfo.status"
              :options="invoiceType"
              placeholder="Anrede"
              class="w-full md:w-[14rem]"
            />
            <label for="invoice-info-status"> Zahlungstatus: </label>
          </FloatLabel>
        </section>
        <div class="flex flex-row justify-start gap-2 items-center mb-4">
          <div class="font-bold">Leistungsdatum:</div>
          <Button @click="onServiceDateCreate" icon="pi pi-plus" rounded text />
        </div>
        <section
          class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center flex-wrap"
        >
          <div
            class="flex flex-row justify-start gap-2 items-center w-full sm:w-auto"
            v-for="(item, idx) in serviceDates"
            :key="item.id"
          >
            <FloatLabel class="my-6 w-full sm:w-auto">
              <Calendar
                :id="item.id.toString()"
                v-model="item.date"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
                class="w-full sm:w-auto"
              />
              <label for="calendar"> Leistungsdatum {{ idx + 1 }} </label>
            </FloatLabel>
            <Button
              @click="onServiceDateDelete(item.id)"
              icon="pi pi-times"
              severity="danger"
              text
            />
          </div>
        </section>
        <section>
          <p class="font-bold mb-5">Rechnungsbeschreibung:</p>
          <FloatLabel>
            <Textarea
              id="text"
              v-model="invoiceInfo.description"
              class="w-full"
              autoResize
              rows="5"
              cols="30"
            />
            <label for="text">Beschreibung</label>
          </FloatLabel>
          <div class="font-bold">Summe:</div>
          <div class="flex flex-row gap-10 my-3">
            <span>Netto: {{ allItemsSum.amountNet }} </span>
            <span>USt: {{ allItemsSum.amountVat }} </span>
            <span>Brutto: {{ allItemsSum.amountGross }}</span>
          </div>
          <SplitButton label="Hinzufügen" :model="items" :class="'w-full'" />
        </section>
      </template>
    </Card>
    <SubOrderItem
      v-for="(item, idx) in invoiceItemsArray"
      :index="idx + 1"
      :item="item"
      :key="item.id"
      :vat-date="invoiceInfo.invoice_date"
      @deleted="onItemDelete"
      @updated="
        (item) => {
          onItemUpdate(item);
        }
      "
    ></SubOrderItem>
  </div>
</template>
