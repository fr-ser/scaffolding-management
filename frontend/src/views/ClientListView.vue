<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { useConfirm } from "primevue/useconfirm";
import { onMounted } from "vue";
import { ref } from "vue";
import { watch } from "vue";

import { deleteClient, getClients } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import type { Client } from "@/global/types/entities";
import { ROUTES } from "@/router";

const confirm = useConfirmations();
const notifications = useNotifications();

const clientsList = ref<Client[]>([]);

const search = ref<string>("");

async function reloadPage() {
  // TODO: use pagination
  clientsList.value = (await getClients(search.value)).data;
}

async function removeClient(client: Client) {
  await deleteClient(client.id);
  reloadPage();
  notifications.showDeleteClientNotification();
}

const confirmDelete = (client: Client) => {
  confirm.showDeleteClientConfirmation(async () => {
    removeClient(client);
  });
};

watch(search, async () => {
  // TODO: add debounce
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
      <router-link
        :to="`${ROUTES.CLIENT.path}/${client.id}/edit`"
        v-for="client in clientsList"
        :key="client.id"
      >
        <Card class="my-2">
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
                  @click.stop.prevent="confirmDelete(client)"
                  label="Löschen"
                  icon="pi pi-times"
                  severity="danger"
                  size="small"
                />
              </div>
            </div>
          </template>
        </Card>
      </router-link>
    </div>
  </div>
</template>

<style></style>
