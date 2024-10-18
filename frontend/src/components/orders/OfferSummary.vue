<script setup lang="ts">
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import { computed, ref, watch } from "vue";

import { updateOffer } from "@/backendClient";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import SubOrderItemButton from "@/components/orders/SubOrderItemButton.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString } from "@/global/helpers";
import { ArticleKind, DocumentKind, OfferStatus } from "@/global/types/appTypes";
import type { Offer } from "@/global/types/entities";
import { calculateItemSumPrice, getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  offer: Offer;
}>();
const notifications = useNotifications();

const confirm = useConfirmations();

const offersType = Object.values(OfferStatus);

let offerStatusValue = ref<OfferStatus>(props.offer.status);
const allItemsSum = computed(() => {
  return calculateItemSumPrice(props.offer.items, props.offer.offered_at);
});

watch(offerStatusValue, async () => {
  confirm.showUpdateOfferStatusConfirmation(async () => {
    await updateOffer(props.offer.id, {
      status: offerStatusValue.value,
    });
    notifications.showUpdateOfferStatusNotification();
  });
});
</script>
<template>
  <section class="flex flex-col justify-items-start gap-2 sm:flex-row sm:gap-8 sm:items-center">
    <p><span class="font-bold">Datum:</span> {{ formatIsoDateString(offer.offered_at) }}</p>
    <p>
      <span class="font-bold">Gültigkeit:</span> {{ formatIsoDateString(offer.offer_valid_until) }}
    </p>
    <p class="font-bold">Status:</p>

    <Dropdown
      v-model="offerStatusValue"
      :options="offersType"
      placeholder="Status"
      class="w-full md:w-[14rem]"
    />
  </section>
  <p class="font-bold">Angebotspreis:</p>
  <section class="flex flex-row gap-10">
    <span> Netto: {{ allItemsSum.amountNet }} </span>
    <span>USt: {{ allItemsSum.amountVat }}</span>
    <span>Brutto: {{ allItemsSum.amountGross }} </span>
  </section>
  <section v-for="(item, idx) in offer.items" class="my-2" :key="item.id">
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
            <div>Brutto: {{ getGrossAmount(item, props.offer.offered_at) }}</div>
          </div>
        </div>
      </template>
    </Card>
  </section>
  <section class="flex flex-row gap-4 mt-3">
    <SubOrderItemButton :id="offer.id" :kind="DocumentKind.offer" />
    <OrderDocuments :id="offer.id" :kind="DocumentKind.offer" />
  </section>
</template>
