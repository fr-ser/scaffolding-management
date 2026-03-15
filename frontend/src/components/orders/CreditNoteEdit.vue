<script setup lang="ts">
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { onMounted, ref } from "vue";

import {
  createCreditNote,
  deleteSubOrder,
  getDocumentsByOrder,
  updateCreditNote,
} from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderPositions from "@/components/orders/SubOrderPositions.vue";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { useCreditNoteValidation } from "@/composables/useOrderLogic";
import { DocumentKind, PaymentStatus } from "@/global/types/appTypes";
import type { CreditNoteItemCreate } from "@/global/types/dataEditTypes";
import type { CreditNote, InvoiceDocument, Order } from "@/global/types/entities";
import { ValidationError } from "@/helpers/utils";

const props = defineProps<{
  existingCreditNote?: CreditNote;
  order: Order;
}>();

const finalExistingSubOrder = ref(props.existingCreditNote);

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

let status = ref(finalExistingSubOrder.value?.status || PaymentStatus.initial);
let description = ref(finalExistingSubOrder.value?.description || "");
let creditNoteItemsArray = ref<CreditNoteItemCreate[]>(
  finalExistingSubOrder.value?.items?.map((item) => ({
    ...item,
    price: item.price != null ? Math.abs(item.price) : item.price,
  })) || [],
);
let creditDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.credit_date) : new Date(),
);

const invoiceDocuments = ref<InvoiceDocument[]>([]);
const selectedInvoiceDocumentIds = ref<string[]>(
  finalExistingSubOrder.value?.referenced_invoice_document_ids || [],
);

onMounted(async () => {
  const docs = await getDocumentsByOrder(props.order.id, {
    kind: DocumentKind.invoice,
    withItems: false,
  });
  invoiceDocuments.value = docs as InvoiceDocument[];
});

async function onDeleteCreditNote() {
  const confirmationResult = await confirm.showConfirmation(
    "Möchten Sie die Gutschrift wirklich löschen?",
  );
  if (!confirmationResult) return;

  try {
    await deleteSubOrder(finalExistingSubOrder.value!.id, DocumentKind.creditNote);
    notifications.showNotification("Die Gutschrift wurde gelöscht.");
    emit("deleted");
  } catch (error) {
    notifications.showNotification("Die Gutschrift konnte nicht gelöscht werden.", "error");
  }
}

const validation = useCreditNoteValidation();

async function onSaveCreditNote() {
  let payload;
  try {
    payload = validation.validateAndCleanPayload({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      credit_date: creditDate.value?.toISOString() as string,
      items: [...creditNoteItemsArray.value],
      referenced_invoice_document_ids: selectedInvoiceDocumentIds.value,
    });
  } catch (err) {
    if (err instanceof ValidationError) return;
    else throw err;
  }

  payload = {
    ...payload,
    items: payload.items.map((item) => ({
      ...item,
      price: item.price != null ? -Math.abs(item.price) : item.price,
    })),
  };

  if (finalExistingSubOrder.value != null) {
    await updateCreditNote(finalExistingSubOrder.value.id, payload);
    notifications.showNotification("Die Gutschriftsänderung wurde gespeichert.");
  } else {
    const newCreditNote = await createCreditNote(payload);
    notifications.showNotification("Eine neue Gutschrift wurde erstellt.");
    finalExistingSubOrder.value = newCreditNote;
  }
}

function onUpdatePositions(positions: CreditNoteItemCreate[]) {
  creditNoteItemsArray.value = positions;
}
</script>

<template>
  <div class="flex flex-row flex-wrap gap-y-2 gap-x-8 sm:justify-end">
    <CreateDocumentButton
      v-if="finalExistingSubOrder"
      :kind="DocumentKind.creditNote"
      :id="finalExistingSubOrder.id"
    />
    <div class="grow" />
    <Button
      v-if="finalExistingSubOrder"
      @click="onDeleteCreditNote"
      label="Gutschrift löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onSaveCreditNote" label="Gutschrift speichern" text raised />
  </div>
  <div class="flex flex-row flex-wrap gap-8 pt-10">
    <section
      class="flex flex-col flex-wrap justify-items-start gap-x-2 gap-y-6 sm:flex-row sm:items-center"
    >
      <FloatLabel>
        <DatePicker
          id="credit-date-input"
          v-model="creditDate"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="credit-date-input">Gutschriftsdatum</label>
      </FloatLabel>
      <FloatLabel class="min-w-32">
        <Select
          id="credit-note-status"
          v-model="status"
          :options="Object.values(PaymentStatus)"
          class="w-full"
        />
        <label for="credit-note-status">Status:</label>
      </FloatLabel>
    </section>
  </div>
  <FloatLabel class="mt-8">
    <Textarea id="description" v-model="description" class="w-full" autoResize rows="2" cols="30" />
    <label for="description">Beschreibung</label>
  </FloatLabel>

  <Divider />

  <div v-if="invoiceDocuments.length > 0" class="mt-6 mb-6">
    <FloatLabel>
      <MultiSelect
        id="referenced-invoices"
        v-model="selectedInvoiceDocumentIds"
        :options="invoiceDocuments"
        optionLabel="id"
        optionValue="id"
        class="w-full"
        display="chip"
      />
      <label for="referenced-invoices">Referenzierte Rechnungen</label>
    </FloatLabel>
  </div>

  <SubOrderPositions
    :vat-date="creditDate || new Date()"
    :sub-order-positions="creditNoteItemsArray"
    @update-positions="onUpdatePositions"
    :has-automatic-rental-note="false"
    :negate="true"
  />
</template>
