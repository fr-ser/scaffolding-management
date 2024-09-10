<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

const emit = defineEmits<{
  findCashDiscount: [cashDiscount: String | undefined];
}>();
const discountChoice = [
  { value: true, label: "Skontoberechtight" },
  { value: false, label: "Nicht Skontoberechtight" },
];
let canHaveCashDiscount = ref();
watch(canHaveCashDiscount, () => {
  emit(
    "findCashDiscount",
    canHaveCashDiscount.value ? "Skontoberechtight" : "Nicht Skontoberechtight",
  );
});
</script>
<template>
  <FloatLabel class="w-full md:w-1/4 mb-2 flex md:self-end">
    <Dropdown
      v-model="canHaveCashDiscount"
      :options="discountChoice"
      class="w-full"
      id="select-discount"
      optionLabel="label"
      optionValue="value"
    />
    <label for="select-discount">Skontoberechtigt</label>
  </FloatLabel>
</template>
