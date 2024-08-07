<script setup lang="ts">
import Card from "primevue/card";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

const props = defineProps<{
  id: string;

  //   item: [];
  valueOfferItem: Boolean;
}>();

//сделать объект с данными, обращаться к клбчзначниеэ////////////////////////
let offerInfo = ref({
  titel: "",
  description: "",
  number: 0,
  unit: null,
  price: 0,
});
</script>

<template>
  <Card class="my-2">
    <template #content>
      <!-- <span v-if="valueOfferItem"> HALLO ARTEM!</span> -->
      <div class="flex flex-col gap-y-6">
        <p class="font-bold">Position {{ id }}</p>
        <FloatLabel>
          <InputText id="titel" v-model="offerInfo.titel" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="offerInfo.description"
            class="w-full"
            autoResize
            rows="3"
            cols="30"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <div v-if="valueOfferItem" class="flex flex-col gap-y-6">
          <FloatLabel>
            <InputText id="number" v-model="offerInfo.number" class="w-full" />
            <label for="number">Anzahl</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="unit" v-model="offerInfo.unit" class="w-full" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="price" v-model="offerInfo.price" class="w-full" />
            <label for="unit">Preis</label>
          </FloatLabel>
          <div>Brutto:</div>
        </div>
      </div>
    </template>
  </Card>
</template>
