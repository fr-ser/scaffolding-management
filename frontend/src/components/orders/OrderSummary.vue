<script setup lang="ts">
import Card from "primevue/card";

import type { Order } from "@/global/types/entities";
import { getClientEditPath } from "@/helpers/routes";

const props = defineProps<{
  orderInfo: Order;
}>();
</script>
<template>
  <Card class="my-2">
    <template #content>
      <div class="mb-4 font-bold">Auftragsdaten</div>
      <section class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center">
        <div><span class="font-bold"> Bauvorhaben: </span>{{ props.orderInfo.title }}</div>
        <div>
          <span class="font-bold"> Auftrags-Nr.: </span>
          {{ props.orderInfo.id }}
        </div>
        <div><span class="font-bold">Status: </span> {{ props.orderInfo.status }}</div>
        <div>
          <span class="font-bold">Kunde: </span>
          <router-link class="underline" :to="getClientEditPath(props.orderInfo.client_id)">
            {{ props.orderInfo.client.first_name }} {{ props.orderInfo.client.last_name }}
            <i class="pi pi-external-link ml-1"></i>
          </router-link>
        </div>
        <div>
          <span class="font-bold">Skonto: </span>
          <span>{{ props.orderInfo.can_have_cash_discount ? "Ja" : "Nein" }}</span>
        </div>
        <div v-if="props.orderInfo.can_have_cash_discount" class="flex flex-row gap-4">
          <div>
            <span class="font-bold">Skontodauer: </span>
            {{ props.orderInfo.discount_duration }}
          </div>
          <div>
            <span class="font-bold">Skonto(%): </span>
            {{ props.orderInfo.discount_percentage }}
          </div>
        </div>
      </section>
    </template>
  </Card>
</template>
