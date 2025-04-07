<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { createOffer, deleteSubOrder, updateOffer } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderPositions from "@/components/orders/SubOrderPositions.vue";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { getBaseOfferAndInvoiceItem, useOfferValidation } from "@/composables/useOrderLogic";
import { DocumentKind, OfferStatus } from "@/global/types/appTypes";
import type { OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Offer, Order } from "@/global/types/entities";

const props = defineProps<{
  existingOffer?: Offer;
  order: Order;
}>();

// we create this intermediate variable to allow setting the offer after saving
const finalExistingSubOrder = ref<Offer | undefined>(props.existingOffer);

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

let status = ref(finalExistingSubOrder.value?.status || OfferStatus.initial);
let description = ref(finalExistingSubOrder.value?.description || "");
let offerItemsArray = ref<OfferItemCreate[]>(
  finalExistingSubOrder.value?.items || [getBaseOfferAndInvoiceItem()],
);
let offerDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.offered_at) : new Date(),
);
let validityDate = ref<Date>(
  finalExistingSubOrder.value
    ? new Date(finalExistingSubOrder.value.offer_valid_until)
    : new Date(),
);

async function onDeleteOffer() {
  const confirmationResult = await confirm.showConfirmation(
    "Möchten Sie das Angebot wirklich löschen?",
  );
  if (!confirmationResult) return;

  try {
    await deleteSubOrder(finalExistingSubOrder.value!.id, DocumentKind.offer);
    notifications.showNotification("Das Angebot wurde gelöscht.");
    emit("deleted");
  } catch (error) {
    notifications.showNotification("Das Angebot konnte nicht gelöscht werden.", "error");
  }
}

const validation = useOfferValidation();

async function onSaveOffer() {
  const payload = validation.validateAndCleanPayload({
    order_id: props.order.id,
    status: status.value,
    description: description.value,
    offered_at: offerDate.value?.toISOString() as string,
    offer_valid_until: validityDate.value?.toISOString() as string,
    items: offerItemsArray.value,
  });

  if (finalExistingSubOrder.value != null) {
    await updateOffer(finalExistingSubOrder.value.id, payload);
    notifications.showNotification("Die Angebotsänderung wurde gespeichert.");
  } else {
    const newOffer = await createOffer(payload);
    notifications.showNotification("Ein neues Angebot wurde erstellt.");
    finalExistingSubOrder.value = newOffer;
  }
}

function onUpdatePositions(positions: OfferItemCreate[]) {
  offerItemsArray.value = positions;
}
</script>

<template>
  <div class="flex flex-row flex-wrap gap-y-2 gap-x-8 sm:justify-end">
    <CreateDocumentButton
      v-if="finalExistingSubOrder"
      :kind="DocumentKind.offer"
      :id="finalExistingSubOrder.id"
    />
    <div class="grow" />
    <Button
      v-if="finalExistingSubOrder"
      @click="onDeleteOffer"
      label="Angebot löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onSaveOffer" label="Angebot speichern" text raised />
  </div>
  <section
    class="mt-10 flex flex-col flex-wrap justify-items-start gap-x-2 gap-y-6 sm:flex-row sm:items-center"
  >
    <FloatLabel>
      <Calendar
        id="offer-date"
        v-model="offerDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="offer-date">Angebotsdatum</label>
    </FloatLabel>
    <FloatLabel>
      <Calendar
        id="offered-until"
        v-model="validityDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="offered-until">Gültig bis</label>
    </FloatLabel>
    <FloatLabel class="min-w-32">
      <Dropdown
        id="offer-status"
        v-model="status"
        :options="Object.values(OfferStatus)"
        class="w-full"
      />
      <label for="offer-status">Angebotsstatus</label>
    </FloatLabel>
  </section>
  <FloatLabel class="mt-8">
    <Textarea id="description" v-model="description" class="w-full" autoResize rows="2" cols="30" />
    <label for="description">Beschreibung</label>
  </FloatLabel>

  <Divider />

  <SubOrderPositions
    :vat-date="offerDate || new Date()"
    :sub-order-positions="offerItemsArray"
    @update-positions="onUpdatePositions"
  />
</template>
