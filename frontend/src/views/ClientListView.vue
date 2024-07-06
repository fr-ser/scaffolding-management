<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { onMounted } from "vue";
import { ref } from "vue";

import { getClients } from "@/backendClient";
import type { Client } from "@/global/types/entities";

const clientsList = ref<Client[]>([]);

const value = ref(null);

onMounted(async () => {
  clientsList.value = await getClients();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="value" placeholder="Kundensuche" class="pl-10 w-full" />
      </span>

      <Button class="md:hidden" icon="pi pi-user" size="small" rounded aria-label="Kunde" />
      <!-- <Button class="hidden md:inline-block" label="Neuen Kunden erstellen" /> -->
    </div>
    <div class="grow overflow-auto">
      <Card class="my-2" v-for="client in clientsList" :key="client.id">
        <template #content>
          <div class="flex gap-2 flex-row justify-between items-center">
            <div>
              {{ `${client.first_name} ${client.last_name}` }}
            </div>
            <div class="flex flex-col gap-y-2">
              <Button
                label="Bearbeiten"
                icon="pi pi-pencil"
                severity="secondary"
                outlined
                size="small"
              />
              <Button label="Löschen" icon="pi pi-times" severity="danger" size="small" />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style></style>
