<script setup lang="ts">
import Card from "primevue/card";

import type { Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

const props = defineProps<{
  orderInfo: Order;
}>();
</script>
<template>
  <Card class="my-2">
    <template #content>
      <div class="mb-4 font-bold">Auftragsdaten</div>
      <div><span class="font-bold"> Bauvorhaben: </span>{{ props.orderInfo.title }}</div>
      <div>
        <span class="font-bold"> Auftrags-Nr.: </span>
        {{ props.orderInfo.id }}
      </div>
      <div><span class="font-bold">Status: </span> {{ props.orderInfo.status }}</div>
      <div>
        <span class="font-bold">Kunde: </span>
        <router-link
          class="underline"
          :to="`${ROUTES.CLIENT.path}/${props.orderInfo.client_id}/edit`"
        >
          {{ props.orderInfo.client.first_name }} {{ props.orderInfo.client.last_name }}
          <i class="pi pi-external-link ml-1"></i>
        </router-link>
      </div>
      <div>
        <span class="font-bold">Skonto: </span>
        <span>{{ props.orderInfo.can_have_cash_discount ? "Ja" : "Nein" }}</span>
      </div>
    </template>
  </Card>
</template>
