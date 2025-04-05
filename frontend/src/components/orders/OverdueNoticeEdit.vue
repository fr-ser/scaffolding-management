<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Dialog from "primevue/dialog";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import ProgressSpinner from "primevue/progressspinner";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import {
  createOverdueNotice,
  deleteSubOrder,
  getDocumentsByOrder,
  updateOverdueNotice,
} from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString, formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import {
  DocumentKind,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";
import type { InvoiceDocument, Order, OverdueNotice } from "@/global/types/entities";

const props = defineProps<{
  existingOverdueNotice?: OverdueNotice;
  order: Order;
}>();

// we create this intermediate variable to allow setting the offer after saving
const finalExistingSubOrder = ref(props.existingOverdueNotice);

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

let noticeLevel = ref(finalExistingSubOrder.value?.notice_level || OverdueNoticeLevel.first);
let paymentStatus = ref(
  finalExistingSubOrder.value?.payment_status || OverdueNoticePaymentStatus.initial,
);
let noticeCosts = ref(finalExistingSubOrder.value?.notice_costs || 0);
let defaultInterest = ref(finalExistingSubOrder.value?.default_interest || 0);
let description = ref(finalExistingSubOrder.value?.description || "");
let noticeDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.notice_date) : new Date(),
);
let paymentTarget = ref<Date | undefined>(
  finalExistingSubOrder.value
    ? new Date(finalExistingSubOrder.value.payment_target)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
);
let paymentsUntil = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.payments_until) : new Date(),
);
let itemsArray = ref<InvoiceDocument[]>(finalExistingSubOrder.value?.invoice_documents || []);

let enrichedItems = computed(() => {
  return itemsArray.value.map((item) => ({
    invoiceDocument: item,
    vatRate: getVatRate({ isoDate: item.invoice_date }),
    netSum: getItemSum(item.items),
  }));
});

let itemsSum = computed(() => {
  return {
    net: itemsArray.value.reduce((sum, item) => sum + getItemSum(item.items), 0),
    vat: itemsArray.value.reduce(
      (sum, item) => sum + getItemSum(item.items) * getVatRate({ isoDate: item.invoice_date }),
      0,
    ),
    gross: itemsArray.value.reduce(
      (sum, item) =>
        sum + getItemSum(item.items) * (1 + getVatRate({ isoDate: item.invoice_date })),
      0,
    ),
  };
});

function onClickRemoveInvoice(deletedInvoiceId: string) {
  itemsArray.value = itemsArray.value.filter((item) => item.id !== deletedInvoiceId);
}

function onClickAddInvoice(newInvoiceDocument: InvoiceDocument) {
  itemsArray.value.push(newInvoiceDocument);
  isAddInvoiceVisible.value = false;
}

const isAddInvoiceVisible = ref(false);
const isAddInvoiceLoading = ref(false);
const unpaidInvoiceDocuments = ref<InvoiceDocument[]>([]);

async function onClickedSearchInvoice() {
  isAddInvoiceLoading.value = true;
  isAddInvoiceVisible.value = true;
  const allInvoices = (await getDocumentsByOrder(props.order.id, {
    withItems: true,
    unpaid: true,
    kind: DocumentKind.invoice,
  })) as InvoiceDocument[];
  unpaidInvoiceDocuments.value = allInvoices.filter(
    (invoice) => !itemsArray.value.some((item) => item.id === invoice.id),
  );
  isAddInvoiceLoading.value = false;
}

async function onClickedDelete() {
  confirm.showConfirmation("Möchten Sie die Mahnung wirklich löschen?", async () => {
    try {
      await deleteSubOrder(finalExistingSubOrder.value!.id, DocumentKind.overdueNotice);
      notifications.showNotification("Die Mahnung wurde gelöscht.");
      emit("deleted");
    } catch (error) {
      notifications.showNotification("Die Mahnung konnte nicht gelöscht werden.", "error");
    }
  });
}

async function onClickSave() {
  if (finalExistingSubOrder.value != null) {
    await updateOverdueNotice(finalExistingSubOrder.value.id, {
      payments_until: paymentsUntil.value?.toISOString(),
      notice_date: noticeDate.value?.toISOString(),
      notice_level: noticeLevel.value,
      payment_target: paymentTarget.value?.toISOString(),
      payment_status: paymentStatus.value,
      notice_costs: noticeCosts.value,
      default_interest: defaultInterest.value,
      description: description.value,
      invoice_documents: itemsArray.value.map((item) => item.id),
    });
    notifications.showNotification("Die Mahnungsänderung wurde gespeichert.");
  } else {
    const newNotice = await createOverdueNotice({
      order_id: props.order.id,
      payments_until: paymentsUntil.value?.toISOString() as string,
      notice_date: noticeDate.value?.toISOString() as string,
      notice_level: noticeLevel.value,
      payment_target: paymentTarget.value?.toISOString() as string,
      payment_status: paymentStatus.value,
      notice_costs: noticeCosts.value,
      default_interest: defaultInterest.value,
      description: description.value,
      invoice_documents: itemsArray.value.map((item) => item.id),
    });
    notifications.showNotification("Eine neue Mahnung wurde erstellt.");
    finalExistingSubOrder.value = newNotice;
  }
}
</script>

<template>
  <div class="flex flex-row flex-wrap gap-y-2 gap-x-8 sm:justify-end">
    <CreateDocumentButton
      v-if="finalExistingSubOrder"
      :kind="DocumentKind.overdueNotice"
      :id="finalExistingSubOrder.id"
    />
    <div class="grow" />
    <Button
      v-if="finalExistingSubOrder"
      @click="onClickedDelete"
      label="Mahnung löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onClickSave" label="Mahnung speichern" text raised />
  </div>
  <section
    class="mt-10 flex flex-col flex-wrap justify-items-start gap-x-2 gap-y-6 sm:flex-row sm:items-center"
  >
    <FloatLabel>
      <Calendar
        id="payments-until"
        v-model="paymentsUntil"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="payments-until">Zahlungen berücksichtigt bis:</label>
    </FloatLabel>
    <FloatLabel>
      <Calendar
        id="notice-date"
        v-model="noticeDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="notice-date">Mahndatum:</label>
    </FloatLabel>
    <FloatLabel>
      <Dropdown
        id="overdueType"
        v-model="noticeLevel"
        :options="Object.values(OverdueNoticeLevel)"
        placeholder="overdue-notice-level"
      />
      <label for="overdue-notice-level">Mahnstufe:</label>
    </FloatLabel>
    <FloatLabel>
      <Calendar
        id="payment-target"
        v-model="paymentTarget"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="payment-target">Zahlungsziel:</label>
    </FloatLabel>
    <FloatLabel class="min-w-32">
      <Dropdown
        id="payment-status"
        v-model="paymentStatus"
        :options="Object.values(PaymentStatus)"
        class="w-full"
      />
      <label for="payment-status">Zahlungsstatus:</label>
    </FloatLabel>
    <FloatLabel>
      <InputNumber
        id="notice-costs"
        v-model="noticeCosts"
        locale="de-DE"
        :minFractionDigits="0"
        :maxFractionDigits="10"
      />
      <label for="notice-costs">Mahnkosten:</label>
    </FloatLabel>
    <FloatLabel>
      <InputNumber
        id="default-interest"
        v-model="defaultInterest"
        locale="de-DE"
        :minFractionDigits="0"
        :maxFractionDigits="10"
      />
      <label for="default-interest">Verzugszinsen:</label>
    </FloatLabel>
  </section>

  <FloatLabel class="mt-8">
    <Textarea id="description" v-model="description" class="w-full" autoResize rows="2" cols="30" />
    <label for="description">Beschreibung</label>
  </FloatLabel>

  <Divider />

  <div class="flex flex-row justify-between flex-wrap gap-4">
    <div class="grow flex flex-row flex-wrap gap-x-10 gap-y-2 items-center">
      <div class="font-bold">Summe:</div>
      <span>Netto: {{ formatNumber(itemsSum.net, { currency: true }) }} </span>
      <span>USt: {{ formatNumber(itemsSum.vat, { currency: true }) }}</span>
      <span>Brutto: {{ formatNumber(itemsSum.gross, { currency: true }) }} </span>
    </div>
    <div class="flex gap-2">
      <Button @click="onClickedSearchInvoice" icon="pi pi-plus" label="Rechnung hinzufügen" />
    </div>
  </div>

  <div class="mt-2" v-for="item in enrichedItems" :key="item.invoiceDocument.id">
    <Divider />
    <div class="flex flex-row justify-between items-center gap-4">
      <div class="flex flex-row flex-wrap gap-6">
        <div><span class="underline">Nummer:</span> {{ item.invoiceDocument.id }}</div>
        <div>
          <span class="underline">Datum:</span>
          {{ formatIsoDateString(item.invoiceDocument.invoice_date) }}
        </div>
        <div>
          <span class="underline">Fällig bis:</span>
          {{ formatIsoDateString(item.invoiceDocument.payment_target) }}
        </div>
        <div>
          <span class="underline">Betrag (Brutto):</span>
          {{ formatNumber(item.netSum * (1 + item.vatRate), { currency: true }) }}
        </div>
      </div>
      <Button
        class="shrink-0"
        @click="onClickRemoveInvoice(item.invoiceDocument.id)"
        icon="pi pi-trash"
        label="Entfernen"
      />
    </div>
  </div>

  <Dialog
    class="w-full sm:w-4/6"
    v-model:visible="isAddInvoiceVisible"
    modal
    header="Unbezahlte Rechnungsdokumente"
  >
    <div v-if="isAddInvoiceLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    {{ unpaidInvoiceDocuments.length === 0 ? "Keine unbezahlten Rechnungsdokumente" : null }}
    <div
      v-for="document in unpaidInvoiceDocuments"
      :key="document.id"
      class="border border-slate-300 hover:border-primary ps-4 py-2 my-2 cursor-pointer"
      @click="onClickAddInvoice(document)"
    >
      {{ document.id }}
    </div>
  </Dialog>
</template>
