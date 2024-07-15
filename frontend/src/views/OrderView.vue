<script setup>
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { OrderStatus } from "@/global/types/appTypes";

const orderStatusTypes = Object.values(OrderStatus);
let status = ref(OrderStatus.preparation);

const discountChoice = ["ja", "nein"];
let discount = ref(discountChoice[0]);

const discountPeriodChoice = ["7", "14"];
let discountPeriod = ref(discountPeriodChoice[0]);

let decription = ref();
</script>
<template>
  <form>
    <div class="flex flex-col gap-y-6">
      <p class="font-bold">Daten</p>
      <FloatLabel>
        <InputText id="constructionProject" class="w-full" />
        <label for="constructionProject">Bauvorhaben</label>
      </FloatLabel>
      <FloatLabel>
        <Dropdown v-model="status" :options="orderStatusTypes" class="w-full" id="select" />
        <label for="select">Status</label>
      </FloatLabel>
      <p class="font-bold">Skonto</p>
      <div class="grid grid-cols-3 gap-1 mt-3">
        <FloatLabel>
          <Dropdown
            v-model="discount"
            :options="discountChoice"
            class="w-full"
            id="selectDiscount"
          />
          <label for="selectDiscount">Skontoberechtig</label>
        </FloatLabel>
        <FloatLabel>
          <Dropdown
            v-model="discountPeriod"
            :options="discountPeriodChoice"
            class="w-full"
            id="select"
          />
          <label for="select">Skontodauer</label>
        </FloatLabel>
        <FloatLabel>
          <InputText id="percent" class="w-full" />
          <label for="percent">Skonto(%)</label>
        </FloatLabel>
      </div>
      <div>
        <label for="description" class="w-full my-3">Beschreibung</label>
        <Textarea v-model="decription" rows="5" class="w-full" id="description" />
      </div>
      <div class="my-1">
        <p class="font-bold">Kunde</p>
        <Button class="my-2" type="button" label="Kunden Zuordnen" severity="secondary"></Button>
      </div>
    </div>

    <div class="flex justify-between gap-2">
      <Button type="button" label="Löschen" severity="secondary"></Button>
      <Button type="button" label="Auftrag Speichern"></Button>
    </div>
  </form>
</template>
