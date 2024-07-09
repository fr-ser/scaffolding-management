<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";

const emit = defineEmits(["close-modal"]);
function onModalClose() {
  emit("close-modal");
}
</script>
<template>
  <Dialog :visible="true" modal :closable="false" header="Edit Profile" :style="{ width: '25rem' }">
    <span class="text-surface-600 dark:text-surface-0/70 block mb-5">Update your information.</span>
    <div class="flex items-center gap-3 mb-3">
      <label for="username" class="font-semibold w-[6rem]">Username</label>
      <InputText id="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-3 mb-5">
      <label for="email" class="font-semibold w-[6rem]">Email</label>
      <InputText id="email" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="onModalClose"></Button>
      <Button type="button" label="Save" @click="onModalClose"></Button>
    </div>
  </Dialog>
</template>
