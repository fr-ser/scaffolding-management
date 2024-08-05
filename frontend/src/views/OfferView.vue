<script setup lang="ts">
import Calendar from "primevue/calendar";
import FloatLabel from "primevue/floatlabel";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getOrder } from "@/backendClient";
import type { Order } from "@/global/types/entities";

const route = useRoute();

let orderInfo = ref<Order | undefined>();

let discountDate = ref();
let validityDate = ref();

onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
});
</script>

<template>
  <div v-if="orderInfo" class="my-2">
    <p>{{ orderInfo.title }}</p>
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
  </div>
</template>
