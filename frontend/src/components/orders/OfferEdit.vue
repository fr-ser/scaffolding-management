<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import Textarea from "primevue/textarea";
import { computed, ref } from "vue";

import { createOffer, deleteSubOrder, updateOffer } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind, OfferStatus } from "@/global/types/appTypes";
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
let offerItemsArray = ref<OfferItemCreate[]>(finalExistingSubOrder.value?.items || []);
let offerDate = ref<Date>(
  finalExistingSubOrder.value ? new Date(finalExistingSubOrder.value.offered_at) : new Date(),
);
let validityDate = ref<Date>(
  finalExistingSubOrder.value
    ? new Date(finalExistingSubOrder.value.offer_valid_until)
    : new Date(),
);

const vatRate = computed(() => {
  return getVatRate({ isoDate: offerDate.value?.toISOString() });
});

function onItemDelete(index: number) {
  offerItemsArray.value = offerItemsArray.value.filter((_, elementIndex) => elementIndex !== index);
}

function onItemUpdate(index: number, item: OfferItemCreate) {
  offerItemsArray.value = offerItemsArray.value.map((element, elementIndex) => {
    if (elementIndex === index) {
      return item;
    } else {
      return element;
    }
  });
}

function onItemCreate(kind: ArticleKind) {
  offerItemsArray.value.push({ kind, title: "", description: "" });
}

const itemsNetSum = computed(function () {
  return getItemSum(offerItemsArray.value);
});

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

async function onSaveOffer() {
  if (finalExistingSubOrder.value != null) {
    await updateOffer(finalExistingSubOrder.value.id, {
      status: status.value,
      description: description.value,
      offered_at: offerDate.value?.toISOString() as string,
      offer_valid_until: validityDate.value?.toISOString() as string,
      items: offerItemsArray.value,
    });
    notifications.showNotification("Die Angebotsänderung wurde gespeichert.");
  } else {
    const newOffer = await createOffer({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      offered_at: offerDate.value?.toISOString() as string,
      offer_valid_until: validityDate.value?.toISOString() as string,
      items: offerItemsArray.value,
    });
    notifications.showNotification("Ein neues Angebot wurde erstellt.");
    finalExistingSubOrder.value = newOffer;
  }
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

  <div class="flex flex-row justify-between flex-wrap gap-4">
    <div class="grow flex flex-row flex-wrap gap-x-10 gap-y-2 items-center">
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

  <SubOrderItem
    v-for="(item, idx) in offerItemsArray"
    :index="idx + 1"
    :item="item"
    :key="idx"
    :vat-date="(offerDate || new Date()).toISOString()"
    @deleted="onItemDelete(idx)"
    @updated="onItemUpdate(idx, item)"
  />
</template>
