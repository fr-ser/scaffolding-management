<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createOverdueNotice } from "@/backendClient";
import { getOrder } from "@/backendClient";
import OrderSummary from "@/components/orders/OrderSummary.vue";
import useNotifications from "@/compositions/useNotifications";
import { OverdueNoticeLevel, OverdueNoticePaymentStatus } from "@/global/types/appTypes";
import type { OverdueNoticeCreate } from "@/global/types/dataEditTypes";
import type { Order } from "@/global/types/entities";
import { formatDateToIsoString } from "@/helpers/utils";
import { ROUTES } from "@/router";

const route = useRoute();
const router = useRouter();
let orderInfo = ref<Order | undefined>();
const notifications = useNotifications();

let overdueInfo = ref<OverdueNoticeCreate>({
  order_id: "",
  description: "",
  notice_date: "",
  payments_until: "",
  payment_target: "",
  sub_id: "",
  notice_level: OverdueNoticeLevel.first,
  payment_status: OverdueNoticePaymentStatus.initial,
  notice_costs: 0,
  default_interest: 0,
});
const overdueType = Object.values(OverdueNoticeLevel);
const paymentStatus = Object.values(OverdueNoticePaymentStatus);

let paymentUntil = ref<Date>();
let paymentTarget = ref<Date>();
let noticeDate = ref<Date>();

async function onSaveOverdue() {
  await createOverdueNotice({
    ...overdueInfo.value,
  });
  router.push(`${ROUTES.ORDER.path}/${route.params.order_id}/edit`);
  notifications.showCreateOverdueNotification();
}
watch(paymentUntil, () => {
  if (paymentUntil.value) {
    overdueInfo.value.payments_until = formatDateToIsoString(paymentUntil.value);
  } else {
    overdueInfo.value.payments_until = "";
  }
});
watch(paymentTarget, () => {
  if (paymentTarget.value) {
    overdueInfo.value.payment_target = formatDateToIsoString(paymentTarget.value);
  } else {
    overdueInfo.value.payment_target = "";
  }
});
watch(noticeDate, () => {
  if (noticeDate.value) {
    overdueInfo.value.notice_date = formatDateToIsoString(noticeDate.value);
  } else {
    overdueInfo.value.notice_date = "";
  }
});
onMounted(async () => {
  orderInfo.value = await getOrder(route.params.order_id as string);
  overdueInfo.value.order_id = orderInfo.value.id;
});
</script>
<template>
  <div v-if="orderInfo">
    <div class="flex flex-row justify-between">
      <router-link :to="`${ROUTES.ORDER.path}/${route.params.order_id}/edit`">
        <Button icon="pi pi-arrow-left" size="small" severity="secondary" text raised />
      </router-link>
      <div class="flex gap-x-2">
        <Button label="Speichern" @click="onSaveOverdue" text raised />
        <Button label="Löschen" severity="danger" text raised />
      </div>
    </div>
    <div class="grid grid-cols-1"></div>
    <OrderSummary :order-info="orderInfo" />
    <Card>
      <template #content>
        <div class="font-bold">Mahnung:</div>
        <section
          class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center"
        >
          <FloatLabel class="my-6">
            <Calendar
              id="payment-until"
              v-model="paymentUntil"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar"> Zahlungen berücksichtigt bis: </label>
          </FloatLabel>
          <FloatLabel class="my-6">
            <Calendar
              id="notice-date"
              v-model="noticeDate"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar"> Mahndatum: </label>
          </FloatLabel>
          <FloatLabel>
            <Dropdown
              id="overdueType"
              v-model="overdueInfo.notice_level"
              :options="overdueType"
              placeholder="Anrede"
              class="w-full md:w-[14rem]"
            />
            <label for="overdue-info-status"> Mahnstufe: </label>
          </FloatLabel>
        </section>
        <div class="my-2 font-bold">Zahlung:</div>
        <section
          class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center"
        >
          <FloatLabel class="my-6">
            <Calendar
              id="payment-target"
              v-model="paymentTarget"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar"> Zahlungziel: </label>
          </FloatLabel>
          <FloatLabel>
            <Dropdown
              id="payment-status"
              v-model="overdueInfo.payment_status"
              :options="paymentStatus"
              placeholder="Anrede"
              class="w-full md:w-[14rem]"
            />
            <label for="invoice-info-status"> Zahlungstatus: </label>
          </FloatLabel>
        </section>
        <div class="my-4 font-bold">Gebühren:</div>
        <section class="grid grid-cols-2 gap-1 mt-3">
          <FloatLabel>
            <InputNumber id="notice-costs" v-model="overdueInfo.notice_costs" class="w-full" />
            <label for="notice-costs">Mahnkosten:</label>
          </FloatLabel>
          <FloatLabel>
            <InputNumber id="" v-model="overdueInfo.default_interest" class="w-full" />
            <label for="">Verzugszinsen:</label>
          </FloatLabel>
        </section>
        <div class="mb-4 mt-2 font-bold">Mahnungsbeschreibung:</div>
        <section>
          <FloatLabel>
            <Textarea
              id="text"
              v-model="overdueInfo.description"
              class="w-full"
              autoResize
              rows="3"
              cols="30"
            />
            <label for="text">Beschreibung</label>
          </FloatLabel>
        </section>
      </template>
    </Card>
  </div>
</template>
