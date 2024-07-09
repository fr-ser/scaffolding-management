<script setup>
const emit = defineEmits(["close-modal"]);
function onButtonClick() {
  emit("close-modal");
}
</script>
<template>
  <div>Hello world!</div>
  <button @click="onButtonClick">close</button>
</template>
