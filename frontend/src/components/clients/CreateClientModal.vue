<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const emit = defineEmits(["close-modal"]);
function onModalClose() {
  emit("close-modal");
}
</script>
<template>
  <Dialog :visible="true" modal :closable="false" :style="{ width: '25rem' }">
    <p>HUUUUI</p>
    <button @click="onModalClose">> close modal</button>
  </Dialog>
</template>
