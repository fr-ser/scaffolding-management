<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import { ref, watch } from "vue";

import { OverdueNoticeLevel } from "@/global/types/appTypes";

const emit = defineEmits<{
  findOverdueNoticeLevel: [overdueStatus: OverdueNoticeLevel | undefined];
}>();
let noticeLevel = ref();
const overdueType = Object.values(OverdueNoticeLevel);

watch(noticeLevel, () => {
  emit("findOverdueNoticeLevel", noticeLevel.value);
});
</script>
<template>
  <FloatLabel class="w-full md:w-1/4 mb-2 flex md:self-end">
    <Dropdown
      id="overdueType"
      v-model="noticeLevel"
      :options="overdueType"
      placeholder="Anrede"
      class="w-full"
    />
    <label for="overdue-info-status"> Mahnstufe: </label>
  </FloatLabel>
</template>
