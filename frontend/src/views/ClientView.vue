<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
let id = 0;
const clientsList = ref([{ id: 1, name: 'Artem Kovshov' }, { id: 2, name: 'Sergej Herbert' }, { id: 3, name: 'Artem Kovshov' }, { id: 4, name: 'Daria Eliseeva' }]);

const value = ref(null);
</script>

<template>
  <div class="card flex w-full gap-x-6">
    <span class="relative grow">
      <i class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600" />
      <InputText v-model="value1" placeholder="Search for client" class="pl-10 w-full" />
    </span>

    <Button class="md:hidden" icon="pi pi-user" size="small" rounded aria-label="User" />
    <Button class="hidden md:inline-block" label="Create new client" />
  </div>
  <card class="my-1" v-for="client in clientsList">
    <template #content>
      {{ client.name }}
      <Button label="Bearbiten" icon="pi pi-pencil" severity="success" size="small" />
      <Button label="Löschen" icon="pi pi-times" severity="danger" size="small" />
    </template>
  </card>

</template>

<style></style>
