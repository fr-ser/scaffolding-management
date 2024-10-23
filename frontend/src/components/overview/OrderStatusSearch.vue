<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

import { OrderStatus } from "@/global/types/appTypes";

const emit = defineEmits<{
  findOrderStatus: [orderStatus: OrderStatus | undefined];
}>();

const orderStatusTypes = Object.values(OrderStatus);
let selectedOrderStatus = ref(OrderStatus.preparation);
watch(
  selectedOrderStatus,
  () => {
    emit("findOrderStatus", selectedOrderStatus.value);
  },
  { deep: true },
);
</script>
<template>
  <FloatLabel class="my-1 w-full sm:w-1/4 mt-6 flex md:self-end">
    <Dropdown
      v-model="selectedOrderStatus"
      :options="orderStatusTypes"
      class="w-full"
      id="select"
    />
    <label for="select">Auftragstatus</label>
  </FloatLabel>
</template>
