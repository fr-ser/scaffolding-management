<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import { createInvoice, deleteSubOrder, updateInvoice } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind, PaymentStatus } from "@/global/types/appTypes";
import type { InvoiceItemCreate } from "@/global/types/dataEditTypes";
import type { Invoice, Order } from "@/global/types/entities";
import { formatDateToIsoString } from "@/helpers/utils";

const props = defineProps<{
  existingInvoice?: Invoice;
  order: Order;
}>();

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

let status = ref(props.existingInvoice?.status || PaymentStatus.initial);
let description = ref(props.existingInvoice?.description || "");
let invoiceItemsArray = ref<InvoiceItemCreate[]>(props.existingInvoice?.items || []);
let invoiceDate = ref<Date>(
  props.existingInvoice ? new Date(props.existingInvoice.invoice_date) : new Date(),
);
let paymentTarget = ref<Date>(
  props.existingInvoice
    ? new Date(props.existingInvoice.payment_target)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
);
let serviceDates = ref<{ date?: Date }[]>(
  props.existingInvoice?.service_dates.map((date) => ({ date: new Date(date) })) || [],
);

const vatRate = computed(() => {
  return getVatRate({ isoDate: invoiceDate.value?.toISOString() });
});

function onServiceDateDelete(index: number) {
  serviceDates.value = serviceDates.value.filter((_, itemIndex) => itemIndex !== index);
}

function onItemDelete(index: number) {
  invoiceItemsArray.value = invoiceItemsArray.value.filter(
    (_, elementIndex) => elementIndex !== index,
  );
}

function onItemUpdate(index: number, item: InvoiceItemCreate) {
  invoiceItemsArray.value = invoiceItemsArray.value.map((element, elementIndex) => {
    if (elementIndex === index) {
      return item;
    } else {
      return element;
    }
  });
}

function onItemCreate(kind: ArticleKind) {
  invoiceItemsArray.value.push({ kind, title: "", description: "" });
}

const itemsNetSum = computed(() => {
  return getItemSum(invoiceItemsArray.value);
});

async function onDeleteInvoice() {
  confirm.showConfirmation("Möchten Sie die Rechnung wirklich löschen?", async () => {
    await deleteSubOrder(props.existingInvoice!.id, DocumentKind.invoice);
    notifications.showNotification("Die Rechnung wurde gelöscht.");
    emit("deleted");
  });
}

async function onSaveInvoice() {
  if (props.existingInvoice != null) {
    await updateInvoice(props.existingInvoice.id, {
      status: status.value,
      description: description.value,
      invoice_date: invoiceDate.value?.toISOString(),
      payment_target: paymentTarget.value?.toISOString(),
      service_dates: serviceDates.value
        .filter((item) => Boolean(item.date))
        .map((element) => formatDateToIsoString(element.date as Date)),
      items: invoiceItemsArray.value,
    });
    notifications.showNotification("Die Rechnungsänderung wurde gespeichert.");
  } else {
    await createInvoice({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      invoice_date: invoiceDate.value?.toISOString() as string,
      payment_target: paymentTarget.value?.toISOString() as string,
      service_dates: serviceDates.value
        .filter((item) => Boolean(item.date))
        .map((element) => formatDateToIsoString(element.date as Date)),
      items: invoiceItemsArray.value,
    });
    notifications.showNotification("Eine neue Rechnung wurde erstellt.");
  }
}
</script>

<template>
  <div class="flex flex-row justify-end gap-8">
    <CreateDocumentButton
      v-if="existingInvoice"
      :kind="DocumentKind.invoice"
      :id="existingInvoice.id"
    />
    <div class="grow" />
    <Button
      v-if="existingInvoice"
      @click="onDeleteInvoice"
      label="Rechnung löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onSaveInvoice" label="Rechnung speichern" text raised />
  </div>
  <Card class="mt-2">
    <template #content>
      <div class="flex flex-row flex-wrap gap-8">
        <section
          class="flex flex-col flex-wrap justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center"
        >
          <FloatLabel>
            <Calendar
              id="invoice-date-input"
              v-model="invoiceDate"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="invoice-date-input">Rechnungsdatum</label>
          </FloatLabel>
          <FloatLabel>
            <Calendar
              id="payment-target-input"
              v-model="paymentTarget"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="payment-target-input">Zahlungsziel</label>
          </FloatLabel>
          <FloatLabel class="min-w-32">
            <Dropdown
              id="invoice-info-status"
              v-model="status"
              :options="Object.values(PaymentStatus)"
              class="w-full"
            />
            <label for="invoice-info-status">Zahlungsstatus:</label>
          </FloatLabel>
        </section>
        <section
          class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center flex-wrap"
        >
          <div
            class="flex flex-row justify-start gap-2 items-center w-full sm:w-auto"
            v-for="(item, idx) in serviceDates"
            :key="idx"
          >
            <FloatLabel class="w-full sm:w-auto">
              <Calendar
                :id="`calendar-${idx + 1}`"
                v-model="item.date"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
                class="w-full sm:w-auto"
              />
              <label :for="`calendar-${idx + 1}`"> Leistungsdatum {{ idx + 1 }} </label>
            </FloatLabel>
            <Button @click="onServiceDateDelete(idx)" icon="pi pi-times" severity="danger" text />
          </div>
          <Button
            @click="serviceDates.push({})"
            icon="pi pi-plus"
            label="Leistungsdatum"
            rounded
            text
          />
        </section>
      </div>
      <FloatLabel class="mt-8">
        <Textarea
          id="description"
          v-model="description"
          class="w-full"
          autoResize
          rows="2"
          cols="30"
        />
        <label for="description">Beschreibung</label>
      </FloatLabel>
    </template>
  </Card>
  <Card class="mt-2">
    <template #content>
      <div class="flex flex-row justify-between flex-wrap gap-4">
        <div class="grow flex flex-row gap-10 items-center">
          <div class="font-bold">Summe:</div>
          <span>Netto: {{ formatNumber(itemsNetSum, { currency: true }) }} </span>
          <span>USt: {{ formatNumber(itemsNetSum * vatRate, { currency: true }) }}</span>
          <span>Brutto: {{ formatNumber(itemsNetSum * (1 + vatRate), { currency: true }) }} </span>
        </div>
        <div class="flex gap-2">
          <Button
            @click="
              onItemCreate(ArticleKind.item);
              notifications.showNotification('Artikel hinzugefügt');
            "
            icon="pi pi-plus"
            label="Artikel"
          />
          <Button
            @click="
              onItemCreate(ArticleKind.heading);
              notifications.showNotification('Hinweis hinzugefügt');
            "
            icon="pi pi-plus"
            label="Hinweis"
          />
        </div>
      </div>
    </template>
  </Card>
  <SubOrderItem
    v-for="(item, idx) in invoiceItemsArray"
    :index="idx + 1"
    :item="item"
    :key="idx"
    :vat-date="(invoiceDate || new Date()).toISOString()"
    @deleted="onItemDelete(idx)"
    @updated="onItemUpdate(idx, item)"
  />
</template>
