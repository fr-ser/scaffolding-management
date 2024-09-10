<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

import { OverdueNoticePaymentStatus } from "@/global/types/appTypes";

const emit = defineEmits<{
  findOverdueStatus: [overdueStatus: OverdueNoticePaymentStatus | undefined];
}>();
let overduePaymentStatus = ref();
const paymentStatus = Object.values(OverdueNoticePaymentStatus);
watch(overduePaymentStatus, () => {
  emit("findOverdueStatus", overduePaymentStatus.value);
});
</script>

<template>
  <FloatLabel class="w-full md:w-1/4 mb-2 mt-6 flex md:self-end">
    <Dropdown
      id="payment-status"
      v-model="overduePaymentStatus"
      :options="paymentStatus"
      placeholder="Anrede"
      class="w-full"
    />
    <label for="invoice-info-status"> Zahlungstatus (Mahnung): </label>
  </FloatLabel>
</template>
