<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

import { deleteArticle, updateArticle } from "@/backendClient";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const emit = defineEmits(["reloadArticleView"]);

const props = defineProps<{
  article: Article;
}>();
const confirm = useConfirm();
const toast = useToast();
const articlesType = Object.values(ArticleKind);

const editableArticle = ref(props.article);

const updateArticleToast = () => {
  toast.add({ severity: "info", summary: "Info", detail: "Article was updated", life: 3000 });
};
const onUpdateArticle = async () => {
  await updateArticle(`${editableArticle.value.id}`, editableArticle.value);
  updateArticleToast();
};

const onDeleteArticle = async () => {
  await deleteArticle(`${editableArticle.value.id}`);
  emit("reloadArticleView");
};
const confirmDelete = () => {
  confirm.require({
    message: "Are you sure you want to delete this article?",
    header: "Confirmation",
    rejectLabel: "Cancel",
    acceptLabel: "Delete",
    accept: async () => {
      await onDeleteArticle();
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "You have deleted this article",
        life: 3000,
      });
    },
  });
};
</script>

<template>
  <Card>
    <template #content>
      <form class="flex flex-col gap-y-3">
        <div>
          <FloatLabel class="mb-6 mt-2">
            <InputText id="titel" v-model="editableArticle.title" class="w-full" />
            <label for="titel">Titel</label>
          </FloatLabel>
          <FloatLabel>
            <Textarea
              id="text"
              v-model="editableArticle.description"
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
                v-model="editableArticle.kind"
                :options="articlesType"
                class="w-full"
                id="select"
              />
              <label for="select">Art</label>
            </FloatLabel>
            <FloatLabel>
              <InputText class="w-full" id="unit" v-model="editableArticle.unit" />
              <label for="unit">Einheit</label>
            </FloatLabel>
          </div>
        </div>
        <div class="flex flex-row justify-end gap-4 mt-4">
          <FloatLabel class="grow">
            <InputNumber class="w-full" id="price" v-model="editableArticle.price" />
            <label for="price">Preis</label>
          </FloatLabel>
          <Button
            @click="onUpdateArticle"
            icon="pi pi-check"
            text
            rounded
            aria-label="Artikeländerung speichern"
          />
          <Button
            @click="confirmDelete"
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            aria-label="Artikel löschen"
          />
        </div>
      </form>
    </template>
  </Card>
</template>
