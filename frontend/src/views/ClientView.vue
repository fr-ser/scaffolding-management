<script setup lang="ts">
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

const selectedGender = ref();

let userInfo = ref({
  name: null,
  surname: null,
  street: null,
  plz: null,
  city: null,
  landline: null,
  mobil: null,
  email: null,
  date: null,
  text: null,
});

const genders = ref([
  { gender: "Herr" },
  { gender: "Frau" },
  { gender: "Frau Dr." },
  { gender: "Herr dr." },
]);
</script>

<template>
  <form>
    <div class="flex flex-row justify-between">
      <Button label="Aufträge anzeigen" severity="secondary" text raised />
      <div class="flex gap-x-2">
        <Button label="Speichern" text raised />
        <Button label="Löschen" severity="danger" text raised />
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-2 xl:grid-cols-4 xl:gap-4">
      <Card class="my-2">
        <template #content>
          <div class="mb-4 font-bold">Name</div>
          <div class="card flex flex-col justify-center gap-y-6">
            <Dropdown
              v-model="selectedGender"
              :options="genders"
              optionLabel="gender"
              placeholder="Anrede"
              class="w-full md:w-[14rem]"
            />
            <FloatLabel>
              <InputText id="user-name" v-model="userInfo.name" class="w-full" />
              <label for="user-name">Vorname</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="usesurname" v-model="userInfo.surname" class="w-full" />
              <label for="usersurname">Nachname</label>
            </FloatLabel>
          </div>
        </template>
      </Card>
      <Card class="my-2">
        <template #content>
          <div class="mb-4 font-bold">Adresse</div>
          <div class="card flex flex-col justify-center gap-y-6">
            <FloatLabel>
              <InputText id="street" v-model="userInfo.street" class="w-full" />
              <label for="street">Straße und Nr.</label>
            </FloatLabel>

            <FloatLabel>
              <InputText id="plz" v-model="userInfo.plz" class="w-full" />
              <label for="plz">PLZ</label>
            </FloatLabel>
            <FloatLabel>
              <InputText id="city" v-model="userInfo.city" class="w-full" />
              <label for="city font-bold">Stadt</label>
            </FloatLabel>
          </div>
        </template>
      </Card>
      <Card class="my-2">
        <template #content>
          <div class="mb-4">Kontakt</div>
          <div class="card flex flex-col justify-center gap-y-6">
            <FloatLabel>
              <InputText id="landline" v-model="userInfo.landline" class="w-full" />
              <label for="landline">Festnetz</label>
            </FloatLabel>

            <FloatLabel>
              <InputNumber id="mobil" v-model="userInfo.mobil" class="w-full" />
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
                v-model="userInfo.date"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
              />
              <label for="calendar">Geburtstag</label>
            </FloatLabel>
            <FloatLabel>
              <Textarea
                id="text"
                v-model="userInfo.text"
                class="w-full"
                autoResize
                rows="5"
                cols="30"
              />
              <label for="text">Kommentar</label>
            </FloatLabel>
          </div>
        </template>
      </Card>
    </div>
  </form>
</template>
