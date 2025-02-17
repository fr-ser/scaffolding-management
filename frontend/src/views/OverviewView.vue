<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import { onMounted, ref } from "vue";

import { getOrders } from "@/backendClient";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type { Order } from "@/global/types/entities";
import { getOrderEditPath, getOrderSubOrderEditPath } from "@/helpers/routes";

const ordersList = ref<Order[]>([]);

const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(true);

async function loadData() {
  const response = await getOrders({ detailed: true, overdue: true, take: take.value });
  ordersList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="mb-6 mt-2 ml-2">
    <div class="flex gap-2">
      <Checkbox :model-value="true" input-id="overdue-filter" binary disabled />
      <label for="overdue-filter">Überfällige Unteraufträge</label>
    </div>
  </div>
  <div v-for="order in ordersList" :key="order.id">
    <Card class="my-2">
      <template #content>
        <div class="flex flex-row justify-between items-center">
          <div>
            <router-link :to="getOrderEditPath(order.id)">
              <span class="font-bold">Auftrag:</span>
              {{
                `${order.client.street_and_number},  ${order.client.postal_code}  ${order.client.city} `
              }}
              <span class="font-bold"> - Kunde:</span
              >{{ ` ${order.client.first_name} ${order.client.last_name}` }}

              <i class="pi pi-external-link ml-1"></i>
            </router-link>
            <ul class="list-disc pl-6 underline mt-3">
              <li class="underlined pb-2" v-if="order.offer">
                <router-link
                  :to="getOrderSubOrderEditPath(order.id, DocumentKind.offer, order.offer.id)"
                >
                  <span>Angebot vom:</span>{{ `${formatIsoDateString(order.offer.offered_at)}` }}
                  <span> - Angebotsstatus:</span> {{ `${order.offer.status}` }}

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
              <li
                class="pb-2"
                v-show="order.invoices"
                v-for="item in order.invoices"
                :key="item.id"
              >
                <router-link
                  :to="getOrderSubOrderEditPath(order.id, DocumentKind.invoice, item.id)"
                >
                  <span>Rechnung vom: {{ formatIsoDateString(item.invoice_date) }}</span>
                  <span> - Zahlungsstatus: {{ item.status }}</span>

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
              <li
                class="pb-2"
                v-show="order.overdue_notices"
                v-for="item in order.overdue_notices"
                :key="item.id"
              >
                <router-link
                  :to="getOrderSubOrderEditPath(order.id, DocumentKind.overdueNotice, item.id)"
                >
                  <span>Mahnung vom: {{ formatIsoDateString(item.notice_date) }}</span>
                  <span> - Zahlungsstatus: {{ item.payment_status }} </span>

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Card>
  </div>

  <div class="flex justify-center">
    <Button v-if="hasMore" @click="loadMore">Weitere Aufträge laden</Button>
  </div>
</template>
