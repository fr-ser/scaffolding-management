<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { onMounted, ref } from "vue";

import { getClients } from "@/backendClient";
import { OrderStatus } from "@/global/types/appTypes";
import type { Client } from "@/global/types/entities";

interface ExtendedClient extends Client {
  full_name?: string;
}

const orderStatusTypes = Object.values(OrderStatus);
let status = ref(OrderStatus.preparation);

const discountChoice = ["ja", "nein"];
let discount = ref<string>(discountChoice[0]);

const discountPeriodChoice = ["7", "14"];
let discountPeriod = ref<string>(discountPeriodChoice[0]);

let decription = ref<string>();

const selectedClient = ref<ExtendedClient>();

const filteredClients = ref<ExtendedClient[]>([]);
const clientsList = ref<ExtendedClient[]>([]);

const searchClient = (event: any) => {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredClients.value = [...clientsList.value];
    } else {
      filteredClients.value = clientsList.value.filter((client: Client) => {
        return (
          client.last_name?.toLowerCase().startsWith(event.query.toLowerCase()) ||
          client.first_name?.toLowerCase().startsWith(event.query.toLowerCase())
        );
      });
    }
  }, 250);
};

onMounted(async () => {
  clientsList.value = (await getClients()).data.map((client: Client) => {
    let full_name: string = "";

    if (client.first_name) full_name += client.first_name + " ";

    if (client.last_name) full_name += client.last_name;

    return {
      ...client,
      full_name,
    };
  });
});

const countries = ref();
const selectedCountry = ref();
const filteredCountries = ref();
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
        <AutoComplete
          v-model="selectedClient"
          optionLabel="full_name"
          :suggestions="filteredClients"
          @complete="searchClient"
          dropdown
        />
      </div>
    </div>

    <div class="flex justify-between gap-2">
      <Button type="button" label="Löschen" severity="secondary"></Button>
      <Button type="button" label="Auftrag Speichern"></Button>
    </div>
  </form>
</template>
