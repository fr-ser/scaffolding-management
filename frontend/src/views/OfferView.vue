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
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import { ArticleKind, OfferStatus } from "@/global/types/appTypes";
import type { OfferCreate, OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Offer, Order } from "@/global/types/entities";
import { calculateItemSumPrice, formatDateToIsoString } from "@/helpers/utils";
import { ROUTES } from "@/router";

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
  // TODO: add validation
  await createOffer({
    ...offerInfo.value,
    items: offerItemsArray.value,
  });

  router.push(`${ROUTES.ORDER.path}/${route.params.order_id}/edit`);
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
  orderInfo.value = await getOrder(route.params.order_id as string);
  offerInfo.value.order_id = orderInfo.value.id;
});
</script>

<template>
  <div class="flex flex-row justify-between">
    <router-link :to="`${ROUTES.ORDER.path}/${route.params.order_id}/edit`">
      <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
    </router-link>
    <div class="flex gap-x-2">
      <Button label="Speichern" text raised @click="onSaveOffer" />
      <Button label="Löschen" severity="danger" text raised />
    </div>
  </div>
  <div v-if="orderInfo" class="grid grid-cols-1">
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Auftragsdaten</div>
        <div><span class="font-bold"> Bauvorhaben: </span>{{ orderInfo.title }}</div>
        <div>
          <span class="font-bold"> Auftrags-Nr.: </span>
          {{ orderInfo.id }}
        </div>
        <div><span class="font-bold">Status: </span> {{ orderInfo.status }}</div>
        <div>
          <span class="font-bold">Kunde: </span>
          <router-link class="underline" :to="`${ROUTES.CLIENT.path}/${orderInfo.client_id}/edit`">
            {{ orderInfo.client.first_name }} {{ orderInfo.client.last_name }}
            <i class="pi pi-external-link ml-1"></i>
          </router-link>
        </div>
        <div>
          <span class="font-bold">Skonto: </span>
          <span>{{ orderInfo.can_have_cash_discount ? "Ja" : "Nein" }}</span>
          <div v-if="orderInfo.can_have_cash_discount">
            <div>
              <span class="font-bold">Skontodauer: </span> {{ orderInfo.discount_duration }}
            </div>
            <div>
              <span class="font-bold"> Skonto(%): </span>{{ orderInfo.discount_percentage }}
            </div>
          </div>
        </div>
      </template>
    </Card>
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Angebot</div>
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
          <label for="calendar"> Gültigkeit(Angebot) </label>
        </FloatLabel>
        <Dropdown
          v-model="offerInfo.status"
          :options="offersType"
          placeholder="Anrede"
          class="w-full md:w-[14rem] mb-3"
        />
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
      :offer-date="offerInfo.offered_at"
      @deleted="onItemDelete"
      @updated="
        (item) => {
          onItemUpdate(item);
        }
      "
    ></SubOrderItem>
  </div>
</template>
