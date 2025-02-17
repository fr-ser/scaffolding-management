<script setup lang="ts">
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import { computed, ref, watch } from "vue";

import { updateOffer } from "@/backendClient";
import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import OrderDocuments from "@/components/orders/OrderDocuments.vue";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { formatIsoDateString, formatNumber, getItemSum, getVatRate } from "@/global/helpers";
import { ArticleKind, DocumentKind, OfferStatus } from "@/global/types/appTypes";
import type { Offer } from "@/global/types/entities";
import { getGrossAmount } from "@/helpers/utils";

const props = defineProps<{
  offer: Offer;
}>();
const notifications = useNotifications();
const confirm = useConfirmations();

const offersType = Object.values(OfferStatus);

let offerStatusValue = ref<OfferStatus>(props.offer.status);

const vatRate = computed(() => {
  return getVatRate({ isoDate: props.offer.offered_at });
});

const itemsNetSum = computed(() => {
  return getItemSum(props.offer.items);
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
    <span>Netto: {{ formatNumber(itemsNetSum, { currency: true }) }} </span>
    <span>USt: {{ formatNumber(itemsNetSum * vatRate, { currency: true }) }}</span>
    <span>Brutto: {{ formatNumber(itemsNetSum * (1 + vatRate), { currency: true }) }} </span>
  </section>
  <section v-for="(item, idx) in offer.items" class="my-2" :key="item.id">
    <Card class="w-full">
      <template #content>
        <div class="grid grid-cols-1 sm:grid-cols-3 sm:gap-2">
          <p class="font-bold">Position {{ idx + 1 }}:</p>
          <div>
            <div>{{ item.title }}</div>
            <div>{{ item.description }}</div>
          </div>
          <div v-if="item.kind === ArticleKind.item">
            <div>Anzahl: {{ item.amount ?? "-" }}</div>
            <div>Einheit: {{ item.unit ?? "-" }}</div>
            <div>Preis: {{ item.price ?? "-" }}</div>
            <div>
              Brutto:
              {{ formatNumber(getGrossAmount(item, props.offer.offered_at), { currency: true }) }}
            </div>
          </div>
        </div>
      </template>
    </Card>
  </section>
  <section class="flex flex-row gap-4 mt-3">
    <CreateDocumentButton :id="offer.id" :kind="DocumentKind.offer" />
    <OrderDocuments :id="offer.id" :kind="DocumentKind.offer" />
  </section>
</template>
