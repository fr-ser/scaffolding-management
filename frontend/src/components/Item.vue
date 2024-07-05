<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

defineProps(["article"]);

const selectedArtikel = ref(null);
const artikel = [{ article: ArticleKind.heading }, { article: ArticleKind.item }];
</script>
<template>
  <Card>
    <template #content>
      <form class="flex flex-col gap-y-3">
        <div>
          <FloatLabel class="mb-6 mt-2">
            <InputText id="titel" v-model="article.titel" class="w-full" />
            <label for="titel">Titel</label>
          </FloatLabel>
          <FloatLabel>
            <Textarea
              id="text"
              v-model="article.text"
              class="w-full"
              autoResize
              rows="5"
              cols="30"
            />
            <label for="text">Bezeichnung</label>
          </FloatLabel>
          <div class="grid grid-cols-2 gap-2 mt-6">
            <FloatLabel>
              <Dropdown
                v-model="selectedArtikel"
                :options="artikel"
                optionLabel="article"
                class="w-full"
                id="select"
              />
              <label for="select">Art</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-full" id="unit" v-model="article.unit" />
              <label for="unit">Einheit</label>
            </FloatLabel>
          </div>
        </div>
        <div class="flex flex-row justify-end gap-4 mt-4">
          <FloatLabel class="grow">
            <InputText class="w-full" id="price" v-model="article.price" />
            <label for="price">Preis</label>
          </FloatLabel>
          <Button icon="pi pi-check" text rounded aria-label="Filter" />
          <Button icon="pi pi-times" severity="danger" text rounded aria-label="Cancel" />
        </div>
      </form>
    </template>
  </Card>
</template>
