<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menubar from 'primevue/menubar';

import NavigationBar from '@/components/NavigationBar.vue'

import { ref } from "vue";

const items = ref([
  {
    label: 'Kunden',
    icon: 'pi pi-user',
    route: '/customers'
  }, {
    label: 'Aufträge',
    icon: 'pi pi-shopping-cart',
    route: '/order'
  }, {
    label: 'Übersicht',
    icon: 'pi pi-search',
    route: '/orders'
  }, {
    label: 'Dokumente',
    icon: 'pi pi-file',
    route: '/documents'
  }, {
    label: 'Artikel',
    icon: 'pi pi-list',
    route: '/articles'
  },

]);
</script>

<template>
  <!-- <NavigationBar /> -->
  <div class="card">
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </router-link>

      </template>
    </Menubar>
  </div>
  <RouterView />

</template>

<style scoped></style>
