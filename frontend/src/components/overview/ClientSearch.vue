<script setup lang="ts">
import AutoComplete from "primevue/autocomplete";
import { onMounted, ref, watch } from "vue";

import { getClients } from "@/backendClient";
import type { Client } from "@/global/types/entities";
import { debounce } from "@/helpers/utils";

const emit = defineEmits<{
  findClient: [client: Client | undefined];
}>();
let selectedClient = ref<Client>();

const filteredClients = ref<Client[]>([]);
const clientsList = ref<Client[]>([]);
const getClientFullName = (client: Client) => {
  let full_name: string = "";

  if (client.first_name) full_name += client.first_name + " ";

  if (client.last_name) full_name += client.last_name;

  return full_name;
};
const searchClient = (event: any) => {
  debounce(() => {
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
  }, 250)();
};
watch(
  selectedClient,
  () => {
    emit("findClient", selectedClient.value);
  },
  { deep: true },
);
onMounted(async () => {
  clientsList.value = (await getClients()).data;
});
</script>
<template>
  <div class="my-1 w-full sm:w-1/4 flex flex-col">
    <p class="font-bold">Kunde</p>
    <AutoComplete
      v-model="selectedClient"
      :optionLabel="getClientFullName"
      :suggestions="filteredClients"
      @complete="searchClient"
      dropdown
      :inputStyle="{ width: '100%' }"
      data-testid="order-client-select"
      :pt="{
        // fixes https://github.com/primefaces/primevue/issues/6141
        // and https://github.com/primefaces/primevue/issues/6103
        dropdownButton: {
          root: {
            ariaHidden: false,
          },
        },
      }"
    />
  </div>
</template>
