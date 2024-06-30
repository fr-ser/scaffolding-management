<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menubar from 'primevue/menubar';

import NavigationBar from '@/components/NavigationBar.vue'

import { ref } from "vue";

const items = ref([
  {
    label: 'Kunden',
    icon: 'pi pi-user'
  }, {
    label: 'Aufträge',
    icon: 'pi pi-shopping-cart'
  }, {
    label: 'Übersicht',
    icon: 'pi pi-search'
  }, {
    label: 'Dokumente',
    icon: 'pi pi-file'
  }, {
    label: 'Artikel',
    icon: 'pi pi-list'
  },

]);
</script>

<template>
  <!-- <NavigationBar /> -->
  <div class="card">
    <Menubar :model="items" />
  </div>
  <RouterView />

</template>

<style scoped></style>
