<script setup lang="ts">
import type { Offer } from "@/global/types/entities";

const props = defineProps<{
  offer: Offer;
}>();
</script>
<template>
  <p class="font-bold">Preis:</p>
</template>
