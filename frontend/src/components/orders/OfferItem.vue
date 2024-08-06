<script setup>
import Card from "primevue/card";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

defineProps(["id"]);
let titel = ref();
let description = ref();
let number = ref(0);
let unit = ref();
let price = ref(0);
</script>
<template>
  <Card class="my-2">
    <!-- <template #title>Position</template> -->
    <template #content>
      <div class="flex flex-col gap-y-6">
        <p class="font-bold">Position {{ id }}</p>
        <FloatLabel>
          <InputText id="titel" v-model="titel" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea id="text" v-model="description" class="w-full" autoResize rows="3" cols="30" />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <FloatLabel>
          <InputText id="number" v-model="number" class="w-full" />
          <label for="number">Anzahl</label>
        </FloatLabel>
        <FloatLabel>
          <InputText id="unit" v-model="unit" class="w-full" />
          <label for="unit">Einheit</label>
        </FloatLabel>
        <FloatLabel>
          <InputText id="price" v-model="price" class="w-full" />
          <label for="unit">Preis</label>
        </FloatLabel>
        <div>Brutto:</div>
      </div>
    </template>
  </Card>
</template>
