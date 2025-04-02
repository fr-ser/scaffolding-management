<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { createClient, deleteClient, getClient, updateClient } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { ClientSalutation } from "@/global/types/appTypes";
import { UserPermissions } from "@/global/types/backendTypes";
import type { ClientCreate, ClientUpdate } from "@/global/types/dataEditTypes";
import { getClientListPath } from "@/helpers/routes";
import { useUserStore } from "@/store";

const userStore = useUserStore();

const confirm = useConfirmations();
const notifications = useNotifications();

const onDeleteClient = async () => {
  try {
    await deleteClient(`${route.params.id}`);
    router.push(getClientListPath());
    notifications.showNotification("Der Kunde wurde gelöscht");
  } catch (error) {
    notifications.showNotification("Der Kunde konnte nicht gelöscht werden.", "error");
  }
};
const confirmDelete = () => {
  confirm.showConfirmation(
    "Sind Sie sich sicher, dass der Kunde gelöscht werden soll?",
    onDeleteClient,
  );
};

let userInfo = ref<ClientUpdate | ClientCreate>({});

let birthdayDate = ref<Date>();
const genders = Object.values(ClientSalutation);

const router = useRouter();
const route = useRoute();

const isEditing = computed(() => {
  return Boolean(route.params.id);
});
const onSaveClient = async () => {
  let requestBody = {
    ...userInfo.value,
  };
  if (birthdayDate.value) {
    requestBody.birthday = birthdayDate.value.toISOString();
  }
  if (isEditing.value) {
    await updateClient(`${route.params.id}`, requestBody);
    notifications.showNotification("Die Änderung der Kundendaten wurde gespeichert");
  } else {
    await createClient(requestBody);
    router.push(getClientListPath());
    notifications.showNotification("Ein neuer Kunde wurde erstellt");
  }
};
function onClientList() {
  router.push(getClientListPath());
}
onMounted(async () => {
  if (isEditing.value) {
    userInfo.value = await getClient(route.params.id as string);
    birthdayDate.value = userInfo.value.birthday ? new Date(userInfo.value.birthday) : undefined;
  }
});
</script>

<template>
  <form>
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
          @click="confirmDelete"
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
              v-model="userInfo.salutation"
              :options="genders"
              placeholder="Anrede"
              class="w-full md:w-[14rem]"
            />
            <FloatLabel>
              <InputText id="first-name" v-model="userInfo.first_name" class="w-full" />
              <label for="first-name">Vorname</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="last-name" v-model="userInfo.last_name" class="w-full" />
              <label for="last-name">Nachname</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="company-name" v-model="userInfo.company_name" class="w-full" />
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
              <InputText id="street" v-model="userInfo.street_and_number" class="w-full" />
              <label for="street">Straße und Nr.</label>
            </FloatLabel>

            <FloatLabel>
              <InputText id="plz" v-model="userInfo.postal_code" class="w-full" />
              <label for="plz">PLZ</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="city" v-model="userInfo.city" class="w-full" />
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
              <InputText id="landline" v-model="userInfo.landline_phone" class="w-full" />
              <label for="landline">Festnetz</label>
            </FloatLabel>

            <FloatLabel>
              <InputText id="mobil" v-model="userInfo.mobile_phone" class="w-full" />
              <label for="mobil">Mobil</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="email" v-model="userInfo.email" class="w-full" />
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
                v-model="userInfo.comment"
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
  </form>
</template>
