<script setup lang="ts">
import Card from "primevue/card";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { getOrder } from "@/backendClient";
import type { Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

const route = useRoute();
let orderInfo = ref<Order | undefined>();
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
</template>
