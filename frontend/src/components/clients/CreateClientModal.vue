<script setup>
import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const emit = defineEmits(["close-modal"]);
function onModalClose() {
  emit("close-modal");
}

let genders = ["Frau", "Frau Dr", "Herr", "Herr Dr"];
let userInfo = ref({
  firstName: genders[0],
  lastName: null,
  street_and_number: null,
  postal_code: null,
  city: null,
  landline_phone: null,
  mobile_phone: null,
  email: null,
  comment: null,
});
let salutation = ref(genders[0]);

let birthdayDate = ref();
</script>
<template>
  <Dialog :visible="true" modal :closable="false" :style="{ width: '25rem' }">
    <!-- <Copmonent></Copmonent> - empty modal, no data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-2 xl:grid-cols-4 xl:gap-4">
      <Card class="my-2">
        <template #content>
          <div class="mb-4 font-bold">Name</div>
          <div class="card flex flex-col justify-center gap-y-6">
            <Dropdown
              v-model="salutation"
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
              <label for="city font-bold">Stadt</label>
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
                id="text"
                v-model="userInfo.comment"
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
    <button @click="onModalClose">> close modal</button>
  </Dialog>
</template>
