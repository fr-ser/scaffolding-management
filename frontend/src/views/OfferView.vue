<script setup lang="ts">
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getOrder } from "@/backendClient";
import { OfferStatus } from "@/global/types/appTypes";
import type { OfferCreate } from "@/global/types/dataEditTypes";
import type { Offer } from "@/global/types/entities";
import type { Order } from "@/global/types/entities";

const route = useRoute();
const offersType = Object.values(OfferStatus);
let orderInfo = ref<Order | undefined>();

let discountDate = ref();
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

onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
});
</script>

<template>
  <div v-if="orderInfo" class="my-2">
    <p>{{ orderInfo.title }} {{ orderInfo.client_id }} {{ orderInfo.status }}</p>

    <div class="mb-4 font-bold">Angebot</div>
    <FloatLabel class="my-6">
      <Calendar
        id="calendar"
        v-model="discountDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="calendar"> Angebotsdatum </label>
    </FloatLabel>
    <FloatLabel class="my-6">
      <Calendar
        id="calendar"
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
      class="w-full md:w-[14rem]"
    />
  </div>
</template>
