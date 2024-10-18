<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

import { PaymentStatus } from "@/global/types/appTypes";

const emit = defineEmits<{
  findInvoicePaymentStatus: [paymentStatus: PaymentStatus | undefined];
}>();
let invoicePaymentStatus = ref();
const invoiceType = Object.values(PaymentStatus);
watch(
  invoicePaymentStatus,
  () => {
    emit("findInvoicePaymentStatus", invoicePaymentStatus.value);
  },
  { deep: true },
);
</script>
<template>
  <FloatLabel class="w-full md:w-1/4 mb-2 flex md:self-end">
    <Dropdown
      id="invoice-info-status"
      v-model="invoicePaymentStatus"
      :options="invoiceType"
      placeholder="Anrede"
      class="w-full"
    />
    <label for="invoice-info-status"> Zahlungstatus: </label>
  </FloatLabel>
</template>
