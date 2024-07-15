<script setup>
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

// import { useRoute } from "vue-router";
import { OrderStatus } from "@/global/types/appTypes";

// const route = useRoute();

// const emit = defineEmits(["close-modal"]);
// function onModalClose() {
//   emit("close-modal");
// }
const orderStatusTypes = Object.values(OrderStatus);
let status = ref(OrderStatus.preparation);

const discountChoice = ["ja", "nein"];
let discount = ref(discountChoice[0]);

const discountPeriodChoice = ["7", "14"];
let discountPeriod = ref(discountPeriodChoice[0]);

let decription = ref();
</script>
<template>
  <!-- <Dialog :visible="true" modal :closable="false" :style="{ width: '25rem' }"> -->
  <form>
    <div class="flex flex-col gap-y-4">
      <p class="font-bold">Daten</p>
      <FloatLabel>
        <InputText id="constructionProject" class="w-full" />
        <label for="constructionProject">Bauvorhaben</label>
      </FloatLabel>
      <Dropdown
        v-model="status"
        :options="orderStatusTypes"
        placeholder="Status"
        class="w-full"
        id="select"
      />
      <p class="font-bold">Skonto</p>
      <div class="grid grid-cols-3 gap-1 mt-6">
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
        <Button
          class="my-2"
          type="button"
          label="Kunden Zuordnen"
          severity="secondary"
          @click="onModalClose"
        ></Button>
      </div>
    </div>

    <div class="flex justify-between gap-2">
      <Button type="button" label="Löschen" severity="secondary" @click="onModalClose"></Button>
      <Button type="button" label="Auftrag Speichern" @click="onModalClose"></Button>
    </div>
  </form>
</template>
