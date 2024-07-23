<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { useConfirm } from "primevue/useconfirm";
import { onMounted } from "vue";
import { ref } from "vue";
import { watch } from "vue";

import { deleteClient, getClients } from "@/backendClient";
import useNotifications from "@/compositions/useNotifications";
import type { Client } from "@/global/types/entities";
import { ROUTES } from "@/router";

const clientsList = ref<Client[]>([]);

const search = ref<string>("");

async function reloadPage() {
  clientsList.value = (await getClients(search.value)).data;
}

// we should provide an argument in the place where we call the function
async function removeClient(client: Client) {
  await deleteClient(client.id);
  reloadPage();
}
const confirm = useConfirm();
const notifications = useNotifications();

const confirmDelete = (client: Client) => {
  confirm.require({
    message: "Sind Sie sich sicher, dass der Kunde gelöscht werden soll?",
    header: "Bestätigung",
    rejectLabel: "Abbrechen",
    rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
    acceptLabel: "Löschen",
    accept: async () => {
      await removeClient(client);
      notifications.showDeleteClientNotification();
    },
  });
};

watch(search, async () => {
  reloadPage();
});

onMounted(async () => {
  reloadPage();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="search" placeholder="Kundensuche" class="pl-10 w-full" />
      </span>
      <router-link :to="`${ROUTES.CLIENT.path}/new`">
        <Button icon="pi pi-user" size="small" rounded aria-label="Neuen Kunden erstellen" />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <Card class="my-2" v-for="client in clientsList" :key="client.id">
        <template #content>
          <div class="flex gap-2 flex-row justify-between items-center">
            <div>
              {{ `${client.first_name} ${client.last_name}` }}
            </div>
            <div class="flex flex-col gap-y-2">
              <router-link :to="`${ROUTES.CLIENT.path}/${client.id}/edit`">
                <Button
                  label="Bearbeiten"
                  icon="pi pi-pencil"
                  severity="secondary"
                  outlined
                  size="small"
                />
              </router-link>
              <Button
                @click="confirmDelete(client)"
                label="Löschen"
                icon="pi pi-times"
                severity="danger"
                size="small"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style></style>
