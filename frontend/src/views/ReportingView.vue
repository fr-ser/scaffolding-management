<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import RadioButton from "primevue/radiobutton";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { getOrderReport } from "@/backendClient";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type { DetailedOrder } from "@/global/types/entities";
import { getOrderEditPath } from "@/helpers/routes";
import { ReportType } from "@/types";

const route = useRoute();

let defaultReportType = ReportType.overdueOrders;

if (Object.keys(ReportType).includes(route.query.report as string)) {
  defaultReportType = ReportType[route.query.report as keyof typeof ReportType];
}

const reportType = ref(defaultReportType);

const ordersList = ref<DetailedOrder[]>([]);

const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(true);

watch(reportType, async () => {
  await loadData();
});

async function loadData() {
  const response = await getOrderReport(reportType.value, { take: take.value });
  ordersList.value = response.data as DetailedOrder[];
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
      <div
        v-for="reportTypeValue in ReportType"
        :key="reportTypeValue"
        class="flex items-center gap-2"
      >
        <RadioButton
          v-model="reportType"
          :inputId="reportTypeValue"
          name="dynamic"
          :value="reportTypeValue"
        />
        <label :for="reportTypeValue">{{ reportTypeValue }}</label>
      </div>
    </div>
  </div>
  <div v-for="order in ordersList" :key="order.id">
    <Card class="my-2">
      <template #content>
        <div class="flex flex-row justify-between items-center">
          <div>
            <router-link :to="getOrderEditPath(order.id)">
              <span class="font-bold">Auftrag:</span>
              {{ order.title }}
              <span class="font-bold"> - Kunde:</span
              >{{ ` ${order.client.first_name} ${order.client.last_name}` }}
              <i class="pi pi-external-link ml-1"></i>
            </router-link>
            <ul class="list-disc pl-6 underline mt-3">
              <li class="underlined pb-2" v-if="order.offer">
                <router-link :to="getOrderEditPath(order.id, DocumentKind.offer, order.offer.id)">
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
                <router-link :to="getOrderEditPath(order.id, DocumentKind.invoice, item.id)">
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
                <router-link :to="getOrderEditPath(order.id, DocumentKind.overdueNotice, item.id)">
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
