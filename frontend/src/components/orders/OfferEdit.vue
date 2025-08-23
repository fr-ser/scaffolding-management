<script setup lang="ts">
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { createOffer, deleteSubOrder, updateOffer } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderPositions from "@/components/orders/SubOrderPositions.vue";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { getAutomaticRentalNote, useOfferValidation } from "@/composables/useOrderLogic";
import { getItemSum } from "@/global/helpers";
import { DocumentKind, OfferStatus } from "@/global/types/appTypes";
import type { OfferItemCreate } from "@/global/types/dataEditTypes";
import type { Offer, Order } from "@/global/types/entities";
import { ValidationError } from "@/helpers/utils";

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

const hasAutomaticRentalNote = ref(!props.existingOffer);

let status = ref(finalExistingSubOrder.value?.status || OfferStatus.initial);
let description = ref(finalExistingSubOrder.value?.description || "");
let offerItemsArray = ref<OfferItemCreate[]>(finalExistingSubOrder.value?.items || []);
let offerDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.offered_at) : new Date(),
);
let validityDate = ref<Date>(
  finalExistingSubOrder.value
    ? new Date(finalExistingSubOrder.value.offer_valid_until)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in milliseconds
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
  let payloadItems: OfferItemCreate[] = [...offerItemsArray.value];
  if (hasAutomaticRentalNote.value) {
    payloadItems.push(getAutomaticRentalNote(getItemSum(offerItemsArray.value)));
  }

  let payload;
  try {
    payload = validation.validateAndCleanPayload({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      offered_at: offerDate.value?.toISOString() as string,
      offer_valid_until: validityDate.value?.toISOString() as string,
      items: payloadItems,
    });
  } catch (err) {
    if (err instanceof ValidationError) return;
    else throw err;
  }

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
      <DatePicker
        id="offer-date"
        v-model="offerDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="offer-date">Angebotsdatum</label>
    </FloatLabel>
    <FloatLabel>
      <DatePicker
        id="offered-until"
        v-model="validityDate"
        dateFormat="dd/mm/yy"
        showIcon
        iconDisplay="input"
      />
      <label for="offered-until">Gültig bis</label>
    </FloatLabel>
    <FloatLabel class="min-w-32">
      <Select
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
    :has-automatic-rental-note="hasAutomaticRentalNote"
    @remove-automatic-rental-note="hasAutomaticRentalNote = false"
  />
</template>
