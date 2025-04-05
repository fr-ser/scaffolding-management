<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createClient, deleteClient, getClient, getOrders, updateClient } from "@/backendClient";
import { useClientValidation } from "@/composables/useClientLogic";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { ClientSalutation } from "@/global/types/appTypes";
import { UserPermissions } from "@/global/types/backendTypes";
import type { ClientUpdate } from "@/global/types/dataEditTypes";
import type { Order } from "@/global/types/entities";
import { getClientListPath, getOrderEditPath } from "@/helpers/routes";
import { useUserStore } from "@/store";

const userStore = useUserStore();

const confirm = useConfirmations();
const notifications = useNotifications();

const isOrderDialogVisible = ref(false);
const isOrderDialogLoading = ref(false);
const clientOrders = ref<Order[]>([]);
const paginationStep = 20;
const takeOrders = ref(paginationStep);
const hasMoreOrders = ref(false);

async function getClientOrders() {
  isOrderDialogVisible.value = true;
  isOrderDialogLoading.value = true;

  const response = await getOrders({ clientId: route.params.id as string, take: takeOrders.value });
  clientOrders.value = response.data;

  hasMoreOrders.value = response.data.length !== response.totalCount;
  isOrderDialogLoading.value = false;
}

async function loadMoreOrders() {
  takeOrders.value += paginationStep;
  const response = await getOrders({ clientId: route.params.id as string, take: takeOrders.value });
  clientOrders.value = response.data;
  hasMoreOrders.value = response.data.length !== response.totalCount;
}

async function onClickDelete() {
  const confirmationResult = await confirm.showConfirmation(
    "Sind Sie sich sicher, dass der Kunde gelöscht werden soll?",
  );
  if (!confirmationResult) return;

  try {
    await deleteClient(`${route.params.id}`);
    router.push(getClientListPath());
    notifications.showNotification("Der Kunde wurde gelöscht");
  } catch (error) {
    notifications.showNotification("Der Kunde konnte nicht gelöscht werden.", "error");
  }
}

let currentClient = ref<ClientUpdate>({}); // the client as shown in the frontend

let birthdayDate = ref<Date>();
const genders = Object.values(ClientSalutation);

const router = useRouter();
const route = useRoute();

const isEditing = computed(() => {
  return Boolean(route.params.id);
});

const clientValidation = useClientValidation();

const onSaveClient = async () => {
  let requestBody = {
    ...currentClient.value,
  };
  if (birthdayDate.value) {
    requestBody.birthday = birthdayDate.value.toISOString();
  }

  const cleanPayload = clientValidation.validateAndCleanClientPayload(requestBody);

  if (isEditing.value) {
    await updateClient(`${route.params.id}`, cleanPayload);
    notifications.showNotification("Die Änderung der Kundendaten wurde gespeichert");
  } else {
    await createClient(cleanPayload);
    router.push(getClientListPath());
    notifications.showNotification("Ein neuer Kunde wurde erstellt");
  }
};
function onClientList() {
  router.push(getClientListPath());
}

onMounted(async () => {
  if (isEditing.value) {
    const clientData = await getClient(route.params.id as string);

    currentClient.value = {
      ...clientData,
    };

    birthdayDate.value = clientData.birthday ? new Date(clientData.birthday) : undefined;
  }
});
</script>

<template>
  <div class="flex flex-row justify-between">
    <Button
      data-testid="return-button"
      @click="onClientList"
      icon="pi pi-arrow-left"
      size="small"
      severity="secondary"
      text
      raised
    />
    <div v-if="userStore.permissions.includes(UserPermissions.CLIENTS_EDIT)" class="flex gap-x-2">
      <Button @click="onSaveClient" label="Speichern" text raised />
      <Button
        @click="onClickDelete"
        v-if="isEditing"
        label="Löschen"
        severity="danger"
        text
        raised
      />
    </div>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-2 xl:grid-cols-4 xl:gap-4">
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Name</div>
        <div class="card flex flex-col justify-center gap-y-6">
          <Dropdown
            v-model="currentClient.salutation"
            :options="genders"
            placeholder="Anrede"
            class="w-full md:w-[14rem]"
          />
          <FloatLabel>
            <InputText id="first-name" v-model="currentClient.first_name" class="w-full" />
            <label for="first-name">Vorname</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="last-name" v-model="currentClient.last_name" class="w-full" />
            <label for="last-name">Nachname</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="company-name" v-model="currentClient.company_name" class="w-full" />
            <label for="company-name">Firma</label>
          </FloatLabel>
        </div>
      </template>
    </Card>
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Adresse</div>
        <div class="card flex flex-col justify-center gap-y-6">
          <FloatLabel>
            <InputText id="street" v-model="currentClient.street_and_number" class="w-full" />
            <label for="street">Straße und Nr.</label>
          </FloatLabel>

          <FloatLabel>
            <InputText id="plz" v-model="currentClient.postal_code" class="w-full" />
            <label for="plz">PLZ</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="city" v-model="currentClient.city" class="w-full" />
            <label for="city">Stadt</label>
          </FloatLabel>
        </div>
      </template>
    </Card>
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Kontakt</div>
        <div class="card flex flex-col justify-center gap-y-6">
          <FloatLabel>
            <InputText id="landline" v-model="currentClient.landline_phone" class="w-full" />
            <label for="landline">Festnetz</label>
          </FloatLabel>

          <FloatLabel>
            <InputText id="mobil" v-model="currentClient.mobile_phone" class="w-full" />
            <label for="mobil">Mobil</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="email" v-model="currentClient.email" class="w-full" />
            <label for="email">E-Mail</label>
          </FloatLabel>
        </div>
      </template>
    </Card>
    <Card class="my-2">
      <template #content>
        <div class="mb-4 font-bold">Sonstiges</div>
        <div class="card flex flex-col justify-center gap-y-6">
          <FloatLabel>
            <Calendar
              id="calendar"
              v-model="birthdayDate"
              dateFormat="dd/mm/yy"
              showIcon
              iconDisplay="input"
            />
            <label for="calendar">Geburtstag</label>
          </FloatLabel>
          <FloatLabel>
            <Textarea
              id="comment"
              v-model="currentClient.comment"
              class="w-full"
              autoResize
              rows="5"
              cols="30"
            />
            <label for="comment">Kommentar</label>
          </FloatLabel>
        </div>
      </template>
    </Card>
  </div>

  <div class="font-bold my-2">Aufträge</div>
  <div class="flex flex-row gap-4">
    <Button
      @click="getClientOrders"
      label="Aufträge des Kunden anzeigen"
      severity="secondary"
      outlined
      size="small"
      data-testid="show-orders-button"
    />
  </div>
  <Dialog class="w-full sm:w-4/6" v-model:visible="isOrderDialogVisible" modal header="Aufträge">
    <div v-if="isOrderDialogLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    {{ clientOrders.length === 0 ? "Keine Dokumente vorhanden" : null }}
    <router-link
      class="block mt-2"
      :to="getOrderEditPath(order.id)"
      v-for="order in clientOrders"
      :key="order.id"
    >
      <div
        class="border border-slate-300 hover:border-primary ps-4 py-1"
        data-testid="client-order"
      >
        {{ order.id }} - {{ order.title }}
      </div>
    </router-link>
    <div class="flex flex-row justify-center mt-4">
      <Button v-if="hasMoreOrders" @click="loadMoreOrders" data-testid="show-more-button"
        >Weitere Aufträge laden</Button
      >
    </div>
  </Dialog>
</template>
