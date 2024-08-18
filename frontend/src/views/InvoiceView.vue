<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import SplitButton from "primevue/splitbutton";
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getOrder } from "@/backendClient";
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import { ArticleKind } from "@/global/types/appTypes";
import { PaymentStatus } from "@/global/types/appTypes";
import type { InvoiceItemCreate } from "@/global/types/dataEditTypes";
import type { Order } from "@/global/types/entities";
import { calculateItemSumPrice, formatDateToIsoString } from "@/helpers/utils";
import { ROUTES } from "@/router";

const route = useRoute();
const toast = useToast();

let itemCount = 1;
let calendarCount = 1;

let invoiceItemsArray = ref<InvoiceItemCreate[]>([]);

let invoiceInfo = ref({
  order_id: "",
  status: PaymentStatus.initial,
  description: "",
  invoice_date: "",
  payment_target: "",
  items: [],
});

let orderInfo = ref<Order | undefined>();
const invoiceType = Object.values(PaymentStatus);
let paymentTarget = ref<Date>();
let invoiceDate = ref<Date>();
let serviceDates = ref<{ id: number; date?: Date }[]>([{ id: 0 }]);

const items = [
  {
    label: "Hinweis hinzugefügen",
    command: () => {
      onItemCreate(ArticleKind.heading);
      toast.add({ severity: "success", detail: "Hinweis hinzugefügt", life: 3000 });
    },
  },
  {
    label: "Position hinzugefügen",
    command: () => {
      onItemCreate(ArticleKind.item),
        toast.add({ severity: "success", detail: "Position hinzugefügt", life: 3000 });
    },
  },
];

function onCalendarCreate() {
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
function onCalendarItemDelete(id: number) {
  serviceDates.value = serviceDates.value.filter((element) => element.id !== id);
}
const allItemsSum = computed(() => {
  return calculateItemSumPrice(invoiceItemsArray.value, invoiceInfo.value.invoice_date);
});
onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
});
</script>
<template>
  <div class="flex flex-row justify-between">
    <router-link :to="`${ROUTES.ORDER.path}/${route.params.order_id}/edit`">
      <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
    </router-link>
    <div class="flex gap-x-2">
      <Button label="Speichern" text raised />
      <Button label="Löschen" severity="danger" text raised />
    </div>
  </div>
  <Card class="my-2">
    <template #content>
      <div class="mb-4 font-bold">Auftragsdaten</div>
      <div><span class="font-bold"> Bauvorhaben: </span>{{ orderInfo?.title }}</div>
      <div>
        <span class="font-bold"> Auftrags-Nr.: </span>
        {{ orderInfo?.id }}
      </div>
      <div><span class="font-bold">Status: </span> {{ orderInfo?.status }}</div>
      <div>
        <span class="font-bold">Kunde: </span>
        <router-link class="underline" :to="`${ROUTES.CLIENT.path}/${orderInfo?.client_id}/edit`">
          {{ orderInfo?.client.first_name }} {{ orderInfo?.client.last_name }}
          <i class="pi pi-external-link ml-1"></i>
        </router-link>
      </div>
      <div>
        <span class="font-bold">Skonto: </span>
        <span>{{ orderInfo?.can_have_cash_discount ? "Ja" : "Nein" }}</span>
      </div>
    </template>
  </Card>
  <Card class="my-2">
    <template #content>
      <div class="mb-4 font-bold">Rechnung:</div>
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
      <div class="mb-2">Zahlungstatus:</div>
      <Dropdown
        v-model="invoiceInfo.status"
        :options="invoiceType"
        placeholder="Anrede"
        class="w-full md:w-[14rem] mb-3"
      />
    </template>
  </Card>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-row justify-between items-center mb-4">
        <div class="font-bold">Leistungsdatum:</div>
        <Button @click="onCalendarCreate" icon="pi pi-plus" rounded outlined />
      </div>
      <div
        class="flex flex-row justify-between items-center"
        v-for="(item, idx) in serviceDates"
        :key="itemCount"
      >
        <FloatLabel class="my-6">
          <Calendar
            :id="item.id.toString()"
            v-model="item.date"
            dateFormat="dd/mm/yy"
            showIcon
            iconDisplay="input"
          />
          <label for="calendar"> Leistungsdatum {{ idx + 1 }} </label>
        </FloatLabel>
        <Button
          @click="onCalendarItemDelete(item.id)"
          icon="pi pi-times"
          severity="danger"
          text
          raised
        />
      </div>
      <!-- <div>add calendars here</div> -->

      <section>
        <p class="font-bold mb-5">Rechnungs-beschreibung:</p>
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
        <!-- add sum -->
        <SplitButton label="Hinzufügen" :model="items" :class="'w-full'" />
      </section>
    </template>
  </Card>
  <SubOrderItem
    v-for="(item, idx) in invoiceItemsArray"
    :index="idx + 1"
    :item="item"
    :key="item.id"
    :conversion-date="invoiceInfo.invoice_date"
    @deleted="onItemDelete"
    @updated="
      (item) => {
        onItemUpdate(item);
      }
    "
  ></SubOrderItem>
</template>
