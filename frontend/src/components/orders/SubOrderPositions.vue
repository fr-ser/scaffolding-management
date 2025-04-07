<script setup lang="ts">
import Button from "primevue/button";
import { computed, nextTick, ref } from "vue";

import SubOrderItem from "@/components/orders/SubOrderItem.vue";
import useNotifications from "@/composables/useNotifications";
import { getAutomaticRentalNote } from "@/composables/useOrderLogic";
import { formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { ArticleKind } from "@/global/types/appTypes";
import type { InvoiceItemCreate, OfferItemCreate } from "@/global/types/dataEditTypes";
import { getScrollableParent } from "@/helpers/utils";

interface ExtendedItem extends OfferItemCreate {
  managedPosition?: boolean;
}

const props = defineProps<{
  subOrderPositions: ExtendedItem[];
  vatDate: Date;
  hasAutomaticRentalNote: boolean;
}>();

const emit = defineEmits<{
  updatePositions: [ExtendedItem[]];
  removeAutomaticRentalNote: [];
}>();

const vatRate = computed(() => {
  return getVatRate({ isoDate: props.vatDate.toISOString() });
});

const notifications = useNotifications();

const itemsNetSum = computed(() => {
  return getItemSum(props.subOrderPositions);
});

const automaticRentalNoteItem = computed(() => {
  return getAutomaticRentalNote(itemsNetSum.value);
});

function onItemDelete(index: number) {
  emit(
    "updatePositions",
    props.subOrderPositions.filter((_, elementIndex) => elementIndex !== index),
  );
}

function onItemUpdate(index: number, item: InvoiceItemCreate) {
  emit(
    "updatePositions",
    props.subOrderPositions.map((element, elementIndex) => {
      if (elementIndex === index) {
        return item;
      } else {
        return element;
      }
    }),
  );
}

const scrollAnchor = ref<HTMLElement | null>(null);

async function onItemCreate(kind: ArticleKind) {
  emit("updatePositions", [...props.subOrderPositions, { kind, title: "", description: "" }]);

  await nextTick(); // wait for DOM update

  const anchor = scrollAnchor.value;
  const scrollable = getScrollableParent(anchor);

  if (scrollable && anchor) {
    scrollable.scrollTo({
      top: anchor.offsetTop,
      behavior: "smooth",
    });
  }
}
</script>

<template>
  <div class="flex flex-row justify-between flex-wrap gap-4">
    <div class="grow flex flex-row flex-wrap gap-x-10 gap-y-2 items-center">
      <div class="font-bold">Summe:</div>
      <span>Netto: {{ formatNumber(itemsNetSum, { currency: true }) }} </span>
      <span>USt: {{ formatNumber(itemsNetSum * vatRate, { currency: true }) }}</span>
      <span>Brutto: {{ formatNumber(itemsNetSum * (1 + vatRate), { currency: true }) }} </span>
    </div>
    <div class="flex flex-wrap items-center gap-2">
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
    v-for="(item, idx) in subOrderPositions"
    :index="idx + 1"
    :item="item"
    :key="idx"
    :vat-date="vatDate.toISOString()"
    @deleted="onItemDelete(idx)"
    @updated="onItemUpdate(idx, item)"
  />
  <div ref="scrollAnchor" style="height: 1px"></div>
  <SubOrderItem
    v-if="hasAutomaticRentalNote"
    :is-app-managed-position="true"
    :index="subOrderPositions.length + 1"
    :item="automaticRentalNoteItem"
    :key="automaticRentalNoteItem.description"
    :vat-date="vatDate.toISOString()"
    @deleted="emit('removeAutomaticRentalNote')"
  />
</template>
