<script setup lang="ts">
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import { computed, ref, watch } from "vue";

import { updateInvoice } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString, formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind, PaymentStatus } from "@/global/types/appTypes";
import type { Invoice } from "@/global/types/entities";
import { getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  invoice: Invoice;
}>();
const paymentStatusOptions = Object.values(PaymentStatus);
let invoiceStatusValue = ref<PaymentStatus>(props.invoice.status);
const notifications = useNotifications();

const confirm = useConfirmations();

const vatRate = computed(() => {
  return getVatRate({ isoDate: props.invoice.invoice_date });
});

const itemsNetSum = computed(() => {
  return getItemSum(props.invoice.items);
});

watch(invoiceStatusValue, async () => {
  confirm.showUpdateInvoiceStatusConfirmation(async () => {
    await updateInvoice(props.invoice.id, {
      status: invoiceStatusValue.value,
    });
    notifications.showUpdateInvoiceStatusNotification();
  });
});
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
      <span class="font-bold">Zahlungsziel:</span> {{ formatIsoDateString(invoice.payment_target) }}
    </p>
    <p class="font-bold">Zahlungsstatus:</p>
    <Dropdown
      v-model="invoiceStatusValue"
      :options="paymentStatusOptions"
      placeholder="Status"
      class="w-full md:w-[14rem]"
    />
  </section>
  <section>
    <p class="font-bold">
      Leistungsdatum:
      <span class="font-normal">
        {{ invoice.service_dates.map(formatIsoDateString).join(", ") }}</span
      >
    </p>
  </section>
  <section>
    <p><span class="font-bold">Rechnungsbeschreibung:</span> {{ invoice.description }}</p>
  </section>
  <p class="font-bold mt-1">Angebotspreis:</p>
  <section class="flex flex-row gap-10">
    <span>Netto: {{ formatNumber(itemsNetSum, { currency: true }) }} </span>
    <span>USt: {{ formatNumber(itemsNetSum * vatRate, { currency: true }) }}</span>
    <span>Brutto: {{ formatNumber(itemsNetSum * (1 + vatRate), { currency: true }) }} </span>
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
            <div>
              Brutto:
              {{
                formatNumber(getGrossAmount(item, props.invoice.invoice_date), { currency: true })
              }}
            </div>
          </div>
        </div>
      </template>
    </Card>
  </section>
  <section class="flex flex-row gap-4 mt-3">
    <CreateDocumentButton :id="invoice.id" :kind="DocumentKind.invoice" />
    <OrderDocuments :id="invoice.id" :kind="DocumentKind.invoice" />
  </section>
</template>
