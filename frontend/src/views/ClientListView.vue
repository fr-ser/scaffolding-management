<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import { computed, onMounted, ref, watch } from "vue";

import { deleteClient, getClients } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { UserPermissions } from "@/global/types/backendTypes";
import type { Client } from "@/global/types/entities";
import { getClientCreatePath, getClientEditPath } from "@/helpers/routes";
import { debounce } from "@/helpers/utils";
import { useUserStore } from "@/store";

const userStore = useUserStore();

const editButtonText = computed(() => {
  return userStore.permissions.includes(UserPermissions.CLIENTS_EDIT)
    ? "Anschauen / Bearbeiten"
    : "Anschauen";
});

const confirm = useConfirmations();
const notifications = useNotifications();
const clientsList = ref<Client[]>([]);

const search = ref("");
const paginationStep = 20;
const take = ref(paginationStep);
const hasMore = ref(false);

async function loadData() {
  const response = await getClients({ search: search.value, take: take.value });
  clientsList.value = response.data;
  hasMore.value = response.data.length !== response.totalCount;
}

async function loadMore() {
  take.value += paginationStep;
  await loadData();
}

async function removeClient(client: Client) {
  await deleteClient(client.id);
  loadData();
  notifications.showDeleteClientNotification();
}

const confirmDelete = (client: Client) => {
  confirm.showDeleteClientConfirmation(async () => {
    removeClient(client);
  });
};

watch(search, debounce(loadData, 250));

onMounted(async () => {
  loadData();
});
</script>

<template>
  <div class="flex flex-col overflow-hidden h-full">
    <div class="flex w-full gap-x-6 mb-3">
      <span class="relative grow flex flex-row items-center">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText
          v-model="search"
          placeholder="Suche (Name oder Firma)"
          class="pl-10 w-full"
          data-testid="client-search-input"
        />
      </span>
      <router-link
        v-if="userStore.permissions.includes(UserPermissions.CLIENTS_EDIT)"
        :to="getClientCreatePath()"
      >
        <Button
          label="Kunden erstellen"
          rounded
          aria-label="Neuen Kunden erstellen"
          data-testid="client-create-button"
        />
      </router-link>
    </div>
    <div class="grow overflow-auto">
      <Card v-for="client in clientsList" :key="client.id" class="mt-2" data-testid="client-card">
        <template #content>
          <div class="flex gap-2 flex-row justify-between items-center">
            <div>
              {{ `${client.first_name} ${client.last_name}` }}
            </div>
            <div class="flex flex-row flex-wrap gap-2">
              <router-link :to="getClientEditPath(client.id)">
                <Button
                  :label="editButtonText"
                  icon="pi pi-pencil"
                  severity="secondary"
                  outlined
                  size="small"
                />
              </router-link>
              <Button
                v-if="userStore.permissions.includes(UserPermissions.CLIENTS_EDIT)"
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
      <div class="mt-2 flex justify-center">
        <Button v-if="hasMore" @click="loadMore">Weitere Kunden laden</Button>
      </div>
    </div>
  </div>
</template>
