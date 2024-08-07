<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { ref } from "vue";

import { getArticles } from "@/backendClient";

const props = defineProps<{
  id: string;
  valueOfferItem: Boolean;
}>();
let visible = ref(false);
let search = ref<string>("");
const articlesList = ref<EditableArticle[]>([]);

async function openArticlesList() {
  visible.value = true;
  articlesList.value = (await getArticles(search.value)).data;
}
let offerInfo = ref({
  titel: "",
  description: "",
  number: 0,
  unit: null,
  price: 0,
});
</script>

<template>
  <Card class="my-2">
    <template #content>
      <div class="flex flex-col gap-y-6">
        <div class="flex flex-row justify-between">
          <p class="font-bold">Position {{ id }}</p>
          <Button
            @click="openArticlesList"
            icon="pi pi-search"
            size="small"
            severity="secondary"
            text
            raised
          />
        </div>

        <FloatLabel>
          <InputText id="titel" v-model="offerInfo.titel" class="w-full" />
          <label for="titel">Titel</label>
        </FloatLabel>
        <FloatLabel>
          <Textarea
            id="text"
            v-model="offerInfo.description"
            class="w-full"
            autoResize
            rows="3"
            cols="30"
          />
          <label for="text">Bezeichnung</label>
        </FloatLabel>
        <div v-if="valueOfferItem" class="flex flex-col gap-y-6">
          <FloatLabel>
            <InputText id="number" v-model="offerInfo.number" class="w-full" />
            <label for="number">Anzahl</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="unit" v-model="offerInfo.unit" class="w-full" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel>
            <InputText id="price" v-model="offerInfo.price" class="w-full" />
            <label for="unit">Preis</label>
          </FloatLabel>
          <div>Brutto:</div>
        </div>
      </div>
    </template>
  </Card>
  <Dialog class="w-full sm:w-4/6" v-model:visible="visible" modal header="Artikel">
    <div v-for="article in articlesList" :key="article.id">
      <div class="border border-slate-300 hover:border-primary ps-4 py-1 my-2">
        {{ article.title }}
      </div>
    </div>
  </Dialog>
</template>
