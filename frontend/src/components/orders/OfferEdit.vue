<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
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

const emit = defineEmits<{
  deleted: [];
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

let status = ref(props.existingOffer?.status || OfferStatus.initial);
let description = ref(props.existingOffer?.description || "");
let offerItemsArray = ref<OfferItemCreate[]>(props.existingOffer?.items || []);
let offerDate = ref<Date>(
  props.existingOffer ? new Date(props.existingOffer.offered_at) : new Date(),
);
let validityDate = ref<Date>(
  props.existingOffer ? new Date(props.existingOffer.offer_valid_until) : new Date(),
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
  confirm.showConfirmation("Möchten Sie das Angebot wirklich löschen?", async function () {
    try {
      await deleteSubOrder(props.existingOffer!.id, DocumentKind.offer);
      notifications.showNotification("Das Angebot wurde gelöscht.");
      emit("deleted");
    } catch (error) {
      notifications.showNotification("Das Angebot konnte nicht gelöscht werden.", "error");
    }
  });
}

async function onSaveOffer() {
  if (props.existingOffer != null) {
    await updateOffer(props.existingOffer.id, {
      status: status.value,
      description: description.value,
      offered_at: offerDate.value?.toISOString() as string,
      offer_valid_until: validityDate.value?.toISOString() as string,
      items: offerItemsArray.value,
    });
    notifications.showNotification("Die Angebotsänderung wurde gespeichert.");
  } else {
    await createOffer({
      order_id: props.order.id,
      status: status.value,
      description: description.value,
      offered_at: offerDate.value?.toISOString() as string,
      offer_valid_until: validityDate.value?.toISOString() as string,
      items: offerItemsArray.value,
    });
    notifications.showNotification("Ein neues Angebot wurde erstellt.");
  }
}
</script>

<template>
  <div class="flex flex-row justify-end gap-8">
    <CreateDocumentButton v-if="existingOffer" :kind="DocumentKind.offer" :id="existingOffer.id" />
    <div class="grow" />
    <Button
      v-if="existingOffer"
      @click="onDeleteOffer"
      label="Angebot löschen"
      severity="danger"
      text
      raised
    />
    <Button @click="onSaveOffer" label="Angebot speichern" text raised />
  </div>
  <Card class="mt-2">
    <template #content>
      <section
        class="flex flex-col flex-wrap justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center"
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
    v-for="(item, idx) in offerItemsArray"
    :index="idx + 1"
    :item="item"
    :key="idx"
    :vat-date="(offerDate || new Date()).toISOString()"
    @deleted="onItemDelete(idx)"
    @updated="onItemUpdate(idx, item)"
  />
</template>
