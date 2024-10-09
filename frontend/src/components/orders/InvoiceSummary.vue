<script setup lang="ts">
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import { computed, ref, watch } from "vue";

import { updateInvoice } from "@/backendClient";
import SubOrderItemButton from "@/components/orders/SubOrderItemButton.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import { ArticleKind, PaymentStatus } from "@/global/types/appTypes";
import type { Invoice } from "@/global/types/entities";
import { calculateItemSumPrice, getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  invoice: Invoice;
}>();
const paymentStatusOptions = Object.values(PaymentStatus);
let invoiceStatusValue = ref<PaymentStatus>(props.invoice.status);
const notifications = useNotifications();

const confirm = useConfirmations();
const allItemsSum = computed(() => {
  return calculateItemSumPrice(props.invoice.items, props.invoice.invoice_date);
});
watch(invoiceStatusValue, async () => {
  confirm.showUpdateInvoiceStatusConfirmation(async () => {
    await updateInvoice(props.invoice.id, {
      status: invoiceStatusValue.value,
    });
    notifications.showUpdateInvoiceStatusNotification();
  });
});
let serviceDates = props.invoice.service_dates.map(formatIsoDateString).join(", ");
</script>
<template>
  <section
    class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center flex-wrap"
  >
    <p>
      <span class="font-bold">Rechnungsdatum: </span>
      {{ formatIsoDateString(invoice.invoice_date) }}
    </p>
    <p>
      <span class="font-bold">Zalungsziel:</span> {{ formatIsoDateString(invoice.payment_target) }}
    </p>
    <p class="font-bold">Zahlungstatus:</p>
    <Dropdown
      v-model="invoiceStatusValue"
      :options="paymentStatusOptions"
      placeholder="Status"
      class="w-full md:w-[14rem]"
    />
  </section>
  <section>
    <p class="font-bold">
      Leistungsdatum: <span class="font-normal"> {{ serviceDates }}</span>
    </p>
  </section>
  <section>
    <p><span class="font-bold">Rechnungsbeschreibung:</span> {{ invoice.description }}</p>
  </section>
  <p class="font-bold mt-1">Angebotspreis:</p>
  <section class="flex flex-row gap-10">
    <span> Netto: {{ allItemsSum.amountNet }} </span>
    <span>USt: {{ allItemsSum.amountVat }}</span>
    <span>Brutto: {{ allItemsSum.amountGross }} </span>
  </section>
  <section v-for="(item, idx) in invoice.items" class="my-2" :key="item.id">
    <Card class="w-full">
      <template #content>
        <div class="grid grid-cols-1 sm:grid-cols-3 sm:gap-2">
          <p class="font-bold">Position{{ idx + 1 }}:</p>
          <div>
            <div>{{ item.title }}</div>
            <div>{{ item.description }}</div>
          </div>
          <div v-if="item.kind === ArticleKind.item">
            <div>Anzahl: {{ item.amount ?? "-" }}</div>
            <div>Einheit: {{ item.unit ?? "-" }}</div>
            <div>Preis: {{ item.price ?? "-" }}</div>
            <div>Brutto: {{ getGrossAmount(item, props.invoice.invoice_date) }}</div>
          </div>
        </div>
      </template>
    </Card>
  </section>
  <SubOrderItemButton :id="invoice.id" :kind="DocumentKind.invoice" />
</template>
