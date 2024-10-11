<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

import { OfferStatus } from "@/global/types/appTypes";

const emit = defineEmits<{
  findOfferStatus: [offerStatus: OfferStatus | undefined];
}>();
let offerStatus = ref();
const offersType = Object.values(OfferStatus);
watch(offerStatus, () => {
  emit("findOfferStatus", offerStatus.value);
});
</script>
<template>
  <FloatLabel class="w-full md:w-1/4 mb-2 flex md:self-end">
    <Dropdown
      id="offer-info-status"
      v-model="offerStatus"
      :options="offersType"
      placeholder="Anrede"
      class="w-full"
    />
    <label for="offer-info-status"> Angebotstatus: </label>
  </FloatLabel>
</template>
