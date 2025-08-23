<script setup lang="ts">
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { createInvoice, deleteSubOrder, updateInvoice } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderPositions from "@/components/orders/SubOrderPositions.vue";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { getAutomaticRentalNote, useInvoiceValidation } from "@/composables/useOrderLogic";
import { getItemSum } from "@/global/helpers";
import { DocumentKind, PaymentStatus } from "@/global/types/appTypes";
import type { InvoiceItemCreate } from "@/global/types/dataEditTypes";
import type { Invoice, Order } from "@/global/types/entities";
import { ValidationError, formatDateToIsoString } from "@/helpers/utils";

const props = defineProps<{
  existingInvoice?: Invoice;
  order: Order;
}>();

// we create this intermediate variable to allow setting the offer after saving
const finalExistingSubOrder = ref(props.existingInvoice);

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

const hasAutomaticRentalNote = ref(!props.existingInvoice);

let status = ref(finalExistingSubOrder.value?.status || PaymentStatus.initial);
let description = ref(finalExistingSubOrder.value?.description || "");
let invoiceItemsArray = ref<InvoiceItemCreate[]>(finalExistingSubOrder.value?.items || []);
let invoiceDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.invoice_date) : new Date(),
);
let paymentTarget = ref<Date>(
  finalExistingSubOrder.value
    ? new Date(finalExistingSubOrder.value.payment_target)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
);
let serviceDates = ref<{ date?: Date }[]>(
  finalExistingSubOrder.value?.service_dates.map((date) => ({ date: new Date(date) })) || [],
);

function onServiceDateDelete(index: number) {
  serviceDates.value = serviceDates.value.filter((_, itemIndex) => itemIndex !== index);
}

async function onDeleteInvoice() {
  const confirmationResult = await confirm.showConfirmation(
    "Möchten Sie die Rechnung wirklich löschen?",
  );
  if (!confirmationResult) return;

  try {
    await deleteSubOrder(finalExistingSubOrder.value!.id, DocumentKind.invoice);
    notifications.showNotification("Die Rechnung wurde gelöscht.");
    emit("deleted");
  } catch (error) {
    notifications.showNotification("Die Rechnung konnte nicht gelöscht werden.", "error");
  }
}

const validation = useInvoiceValidation();

async function onSaveInvoice() {
  let payloadItems: InvoiceItemCreate[] = [...invoiceItemsArray.value];
  if (hasAutomaticRentalNote.value) {
    payloadItems.push(getAutomaticRentalNote(getItemSum(invoiceItemsArray.value)));
  }

  let payload;
  try {
    payload = validation.validateAndCleanPayload({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      invoice_date: invoiceDate.value?.toISOString() as string,
      payment_target: paymentTarget.value?.toISOString() as string,
      service_dates: serviceDates.value
        .filter((item) => Boolean(item.date))
        .map((element) => formatDateToIsoString(element.date as Date)),
      items: payloadItems,
    });
  } catch (err) {
    if (err instanceof ValidationError) return;
    else throw err;
  }

  if (finalExistingSubOrder.value != null) {
    await updateInvoice(finalExistingSubOrder.value.id, payload);
    notifications.showNotification("Die Rechnungsänderung wurde gespeichert.");
  } else {
    const newInvoice = await createInvoice(payload);
    notifications.showNotification("Eine neue Rechnung wurde erstellt.");
    finalExistingSubOrder.value = newInvoice;
  }
}

function onUpdatePositions(positions: InvoiceItemCreate[]) {
  invoiceItemsArray.value = positions;
}
</script>

<template>
  <div class="flex flex-row flex-wrap gap-y-2 gap-x-8 sm:justify-end">
    <CreateDocumentButton
      v-if="finalExistingSubOrder"
      :kind="DocumentKind.invoice"
      :id="finalExistingSubOrder.id"
    />
    <div class="grow" />
    <Button
      v-if="finalExistingSubOrder"
      @click="onDeleteInvoice"
      label="Rechnung löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onSaveInvoice" label="Rechnung speichern" text raised />
  </div>
  <div class="flex flex-row flex-wrap gap-8 pt-10">
    <section
      class="flex flex-col flex-wrap justify-items-start gap-x-2 gap-y-6 sm:flex-row sm:items-center"
    >
      <FloatLabel>
        <DatePicker
          id="invoice-date-input"
          v-model="invoiceDate"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="invoice-date-input">Rechnungsdatum</label>
      </FloatLabel>
      <FloatLabel>
        <DatePicker
          id="payment-target-input"
          v-model="paymentTarget"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="payment-target-input">Zahlungsziel</label>
      </FloatLabel>
      <FloatLabel class="min-w-32">
        <Select
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
          <DatePicker
            :id="`service-date-${idx + 1}`"
            v-model="item.date"
            dateFormat="dd/mm/yy"
            showIcon
            iconDisplay="input"
            class="w-full sm:w-auto"
          />
          <label :for="`service-date-${idx + 1}`"> Leistungsdatum {{ idx + 1 }} </label>
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
    <Textarea id="description" v-model="description" class="w-full" autoResize rows="2" cols="30" />
    <label for="description">Beschreibung</label>
  </FloatLabel>

  <Divider />

  <SubOrderPositions
    :vat-date="invoiceDate || new Date()"
    :sub-order-positions="invoiceItemsArray"
    @update-positions="onUpdatePositions"
    :has-automatic-rental-note="hasAutomaticRentalNote"
    @remove-automatic-rental-note="hasAutomaticRentalNote = false"
  />
</template>
