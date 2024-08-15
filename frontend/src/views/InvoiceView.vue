<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getOrder } from "@/backendClient";
import { PaymentStatus } from "@/global/types/appTypes";
import type { Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

const route = useRoute();
let orderInfo = ref<Order | undefined>();
const invoiceType = Object.values(PaymentStatus);
let paymentTarget = ref();
let invoiceDate = ref();
let invoiceStatus = PaymentStatus.initial;
onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
});
</script>
<template>
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
          id="calendar"
          v-model="invoiceDate"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="calendar"> Rechnungsdatum </label>
      </FloatLabel>
      <FloatLabel class="my-6">
        <Calendar
          id="offered-at-input"
          v-model="paymentTarget"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="calendar"> Zalungsziel </label>
      </FloatLabel>
      <div class="mb-2">Zahlungstatus:</div>
      <Dropdown
        v-model="invoiceStatus"
        :options="invoiceType"
        placeholder="Anrede"
        class="w-full md:w-[14rem] mb-3"
      />
    </template>
  </Card>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-row justify-between">
        <div class="mb-4 font-bold">Leistungsdatum:</div>
        <Button icon="pi pi-plus" rounded outlined />
      </div>
    </template>
  </Card>
</template>
