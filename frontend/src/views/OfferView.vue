<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import Textarea from "primevue/textarea";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

import { getOrder } from "@/backendClient";
import { OfferStatus } from "@/global/types/appTypes";
import type { OfferCreate } from "@/global/types/dataEditTypes";
import type { Offer } from "@/global/types/entities";
import type { Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

const route = useRoute();
const offersType = Object.values(OfferStatus);
let orderInfo = ref<Order | undefined>();
let offerDate = ref();
let validityDate = ref();
let offerInfo = ref<OfferCreate | Offer>({
  order_id: "",
  order: orderInfo.value,
  status: OfferStatus.initial,
  description: "",
  offered_at: "",
  offer_valid_until: "",
  items: [],
});
const router = useRouter();

onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
});
</script>

<template>
  <div class="flex flex-row justify-between">
    <router-link :to="`${ROUTES.ORDER.path}/${orderInfo?.id}/edit`">
      <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
    </router-link>
    <div class="flex gap-x-2">
      <Button label="Speichern" text raised />
      <Button label="Löschen" severity="danger" text raised />
    </div>
  </div>
  <div v-if="orderInfo" class="my-2">
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
    <Card>
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
          <span class="font-bold">Angebots-beschreibung: </span>
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
        </div>
      </template>
    </Card>
    <Card class="my-2">
      <template #content>
        <div>
          <span class="font-bold">Position: </span>
        </div>
        <!-- <div class="card flex flex-col justify-center gap-y-5">
          <span class="font-bold">Angebots-beschreibung: </span>
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
          </FloatLabel> -->
        <div class="grid grid-cols-2 gap-4 mt-3">
          <Button label="Add note" severity="secondary" outlined size="small"></Button>
          <Button label="Add position" severity="success" outlined size="small"></Button>
        </div>
        <!-- </div> -->
      </template>
    </Card>
  </div>
</template>
