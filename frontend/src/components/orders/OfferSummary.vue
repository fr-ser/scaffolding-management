<script setup lang="ts">
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import { computed, ref, watch } from "vue";

import { updateOffer } from "@/backendClient";
import useNotifications from "@/compositions/useNotifications";
import { formatNumber, getVatRate, round } from "@/global/helpers";
import { OfferStatus } from "@/global/types/appTypes";
import type { Offer, OfferItem } from "@/global/types/entities";
import { calculatePrice, formatDateToIsoString } from "@/helpers/utils";

const props = defineProps<{
  offer: Offer;
}>();
const notifications = useNotifications();

const offersType = Object.values(OfferStatus);

let offerStatusValue = ref<OfferStatus>(props.offer.status);
const allItemsSum = computed(() => {
  return calculatePrice(props.offer.items, props.offer.offered_at);
});
function getBrutto(item: OfferItem, date: string) {
  let amountNet = 0;
  let amountGross = 0;
  const amount = item.amount ?? 0;
  const price = item.price ?? 0;
  amountNet += round(amount * price, 2);
  amountGross += round(amountNet * (1 + getVatRate({ isoDate: date })), 2);
  return formatNumber(amountGross, { decimals: 2, currency: true });
}
watch(offerStatusValue, async () => {
  await updateOffer(props.offer.id, {
    status: offerStatusValue.value,
  });

  notifications.showUpdateOfferStatusNotification();
});
</script>
<template>
  <p class="font-bold">Angebot:</p>
  <section class="flex flex-col gap-2 sm:flex-row sm:gap-8">
    <span> Datum: {{ offer.offered_at }}</span>
    <span> Gültigkeit: {{ offer.offer_valid_until }} </span>
    <Dropdown
      v-model="offerStatusValue"
      :options="offersType"
      placeholder="Anrede"
      class="w-full md:w-[14rem] mb-3"
    />
  </section>
  <p class="font-bold">Preis:</p>
  <section class="flex flex-row gap-10">
    <span cl> Netto: {{ allItemsSum.calculatedResultNetto }} </span>
    <span>USt: {{ allItemsSum.calculatedResultUst }}</span>
    <span>Brutto: {{ allItemsSum.calculatedResultBrutto }} </span>
  </section>
  <section v-for="(item, idx) in offer.items" class="my-2">
    <Card class="w-full">
      <template #content>
        <div class="grid grid-cols-1 sm:grid-cols-3 sm:gap-2">
          <p class="font-bold">Position{{ idx + 1 }}:</p>
          <div>
            <div>{{ item.title }}</div>
            <div>{{ item.description }}</div>
          </div>
          <div>
            <div>Anzahl: {{ item.amount ?? "-" }}</div>
            <div>Einheit: {{ item.unit ?? "-" }}</div>
            <div>Preis: {{ item.price ?? "-" }}</div>
            <div>BruttoSumme: {{ getBrutto(item, props.offer.offered_at) }}</div>
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>
