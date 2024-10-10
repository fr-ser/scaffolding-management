<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { ref, watch } from "vue";

import { updateOverdueNotice } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString } from "@/global/helpers";
import { OverdueNoticeLevel, OverdueNoticePaymentStatus } from "@/global/types/appTypes";
import type { OverdueNotice } from "@/global/types/entities";

const props = defineProps<{
  overdue: OverdueNotice;
}>();
const notifications = useNotifications();

const confirm = useConfirmations();
const overdueType = Object.values(OverdueNoticeLevel);
const paymentStatus = Object.values(OverdueNoticePaymentStatus);
let noticeLevel = ref(props.overdue.notice_level);
let overduePaymentStatus = ref(props.overdue.payment_status);

watch(noticeLevel, async () => {
  confirm.showUpdateOverdueNoticeLevelConfirmation(async () => {
    await updateOverdueNotice(props.overdue.id, {
      notice_level: noticeLevel.value,
    });
    notifications.showUpdateOverdueNoticeLevelNotification();
  });
});
</script>

<template>
  <section
    class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center flex-wrap"
  >
    <p>
      <span class="font-bold">Zahlungen berücksichtigt bis: </span>
      {{ formatIsoDateString(overdue.payments_until) }}
    </p>
    <p>
      <span class="font-bold">Mahndatum: </span>
      {{ formatIsoDateString(overdue.notice_date) }}
    </p>
    <p><span class="font-bold">Mahnstufe:</span></p>
    <Dropdown
      id="overdueType"
      v-model="noticeLevel"
      :options="overdueType"
      placeholder="Anrede"
      class="w-full md:w-[14rem]"
    />
    <p>
      <span class="font-bold">Zalungsziel:</span> {{ formatIsoDateString(overdue.payment_target) }}
    </p>
    <p><span class="font-bold">Zahlungstatus:</span></p>
    <Dropdown
      id="overdueZahlungStatus"
      v-model="overduePaymentStatus"
      :options="paymentStatus"
      placeholder="Anrede"
      class="w-full md:w-[14rem]"
    />
    <p><span class="font-bold">Mahnkosten: </span>{{ overdue.notice_costs }}</p>
    <p><span class="font-bold">Verzugszinsen: </span>{{ overdue.default_interest }}</p>
    <p><span class="font-bold">Beschreibung: </span>{{ overdue.description }}</p>
  </section>
</template>
