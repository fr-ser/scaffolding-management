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

import { createOffer, getOrder } from "@/backendClient";
import OrderSummary from "@/components/orders/OrderSummary.vue";
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import { ArticleKind, OfferStatus } from "@/global/types/appTypes";
import type { OfferCreate, OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Offer, Order } from "@/global/types/entities";
import { getOrderEditPath } from "@/helpers/routes";
import { calculateItemSumPrice, formatDateToIsoString } from "@/helpers/utils";

let itemCount = 1;
const route = useRoute();
const router = useRouter();

const offersType = Object.values(OfferStatus);
let orderInfo = ref<Order | undefined>();
let offerDate = ref<Date>();
let validityDate = ref<Date>();

let offerInfo = ref<OfferCreate | Offer>({
  order_id: "",
  status: OfferStatus.initial,
  description: "",
  offered_at: "",
  offer_valid_until: "",
  items: [],
});

let offerItemsArray = ref<OfferItemCreate[]>([]);
function onItemUpdate(item: OfferItemCreate) {
  offerItemsArray.value = offerItemsArray.value.map((element) => {
    if (element.id === item.id) {
      return item;
    } else {
      return element;
    }
  });
}

function onItemCreate(kind: ArticleKind) {
  offerItemsArray.value.push({ id: itemCount++, kind, title: "", description: "" });
}

const toast = useToast();
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

async function onSaveOffer() {
  await createOffer({
    ...offerInfo.value,
    items: offerItemsArray.value,
  });

  router.push(getOrderEditPath(route.params.order_id as string));
}
function onItemDelete(id: number) {
  offerItemsArray.value = offerItemsArray.value.filter((element) => element.id !== id);
}
const allItemsSum = computed(() => {
  return calculateItemSumPrice(offerItemsArray.value, offerInfo.value.offered_at);
});

watch(offerDate, () => {
  if (offerDate.value) {
    offerInfo.value.offered_at = formatDateToIsoString(offerDate.value);
  } else {
    offerInfo.value.offered_at = "";
  }
});

watch(validityDate, () => {
  if (validityDate.value) {
    offerInfo.value.offer_valid_until = formatDateToIsoString(validityDate.value);
  } else {
    offerInfo.value.offer_valid_until = "";
  }
});

onMounted(async () => {
  orderInfo.value = await getOrder(route.params.orderId as string);
  offerInfo.value.order_id = orderInfo.value.id;
});
</script>

<template>
  <div v-if="orderInfo">
    <div class="flex flex-row justify-between">
      <router-link :to="getOrderEditPath(route.params.orderId as string)">
        <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
      </router-link>
      <div class="flex gap-x-2">
        <Button label="Speichern" text raised @click="onSaveOffer" />
        <Button label="Löschen" severity="danger" text raised />
      </div>
    </div>
    <div class="grid grid-cols-1">
      <OrderSummary :order-info="orderInfo" />
      <Card class="my-2">
        <template #content>
          <div class="mb-4 font-bold">Angebot</div>
          <section
            class="flex flex-col justify-items-start items-center gap-2 sm:flex-row sm:gap-8 sm:items-center"
          >
            <FloatLabel class="my-6">
              <Calendar
                id="calendar"
                v-model="offerDate"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
              />
              <label for="calendar"> Angebotsdatum </label>
            </FloatLabel>
            <FloatLabel class="my-6">
              <Calendar
                id="offered-at-input"
                v-model="validityDate"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
              />
              <label for="offered-at-input"> Gültigkeit(Angebot) </label>
            </FloatLabel>
            <FloatLabel>
              <Dropdown
                id="offer-info-status"
                v-model="offerInfo.status"
                :options="offersType"
                placeholder="Anrede"
                class="w-full md:w-[14rem]"
              />
              <label for="offer-info-status"> Angebotstatus: </label>
            </FloatLabel>
          </section>
          <div class="card flex flex-col justify-center gap-y-5">
            <span class="font-bold">Angebotsbeschreibung: </span>
            <FloatLabel>
              <Textarea
                id="text"
                v-model="offerInfo.description"
                class="w-full"
                autoResize
                rows="5"
                cols="30"
              />
              <label for="text">Beschreibung</label>
            </FloatLabel>
            <div class="font-bold">Summe:</div>
            <div class="flex flex-row gap-10">
              <span>Netto: {{ allItemsSum.amountNet }} </span>
              <span>USt: {{ allItemsSum.amountVat }} </span>
              <span>Brutto: {{ allItemsSum.amountGross }}</span>
            </div>
            <SplitButton label="Hinzufügen" :model="items" :class="'w-full'" />
          </div>
        </template>
      </Card>
      <SubOrderItem
        v-for="(item, idx) in offerItemsArray"
        :index="idx + 1"
        :item="item"
        :key="item.id"
        :vat-date="offerInfo.offered_at"
        @deleted="onItemDelete"
        @updated="
          (item) => {
            onItemUpdate(item);
          }
        "
      ></SubOrderItem>
    </div>
  </div>
</template>
