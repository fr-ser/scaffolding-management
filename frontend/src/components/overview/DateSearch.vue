<script setup lang="ts">
import Calendar from "primevue/calendar";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

const emit = defineEmits<{
  findDate: [fromDate: Date | undefined, afterDate: Date | undefined];
}>();
let fromDate = ref<Date>();
let afterDate = ref<Date>();
const props = defineProps<{
  title: string;
}>();
watch(
  [fromDate, afterDate],
  () => {
    if (fromDate.value && afterDate.value) {
      emit("findDate", fromDate.value, afterDate.value);
    }
  },
  { deep: true },
);
</script>
<template>
  <div class="flex flex-col">
    <section class="flex flex-row gap-1 mb-2">
      <FloatLabel class="mt-6">
        <Calendar
          id="invoice-date-input"
          v-model="fromDate"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="calendar">{{ props.title }} von</label>
      </FloatLabel>
      <FloatLabel class="mt-6">
        <Calendar
          id="invoice-secondDate-input"
          v-model="afterDate"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
        />
        <label for="calendar">{{ props.title }} Bis </label>
      </FloatLabel>
    </section>
  </div>
</template>
