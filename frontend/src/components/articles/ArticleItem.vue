<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
// import { useConfirm } from "primevue/useconfirm";
import { ref } from "vue";

import { createArticle, deleteArticle, updateArticle } from "@/backendClient";
import useConfirmations from "@/compositions/useConfirmations";
import useNotifications from "@/compositions/useNotifications";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const emit = defineEmits(["reloadArticleView"]);

const props = defineProps<{
  article: Article;
  isNew?: boolean;
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

const articlesType = Object.values(ArticleKind);

const editableArticle = ref(props.article);

const onUpdateArticle = async () => {
  if (props.isNew) {
    await createArticle(editableArticle.value);
    notifications.showCreateArticleNotification();
    emit("reloadArticleView");
  } else {
    await updateArticle(`${editableArticle.value.id}`, editableArticle.value);
    notifications.showUpdateArticleNotification();
  }
};

const onDeleteArticle = async () => {
  await deleteArticle(`${editableArticle.value.id}`);
  emit("reloadArticleView");
  notifications.showDeleteArticleNotification();
};
const confirmDelete = () => {
  confirm.showDeleteArticleConfirmation(onDeleteArticle);
};

// const confirmDelete = () => {
//   confirm.require({
//     message: "Wollen Sie den Artikel sicher wirklich löschen?",
//     header: "Bestätigung",
//     rejectLabel: "Abbrechen",
//     acceptLabel: "Löschen",
//     accept: async () => {
//       await onDeleteArticle();
//       notifications.showDeleteArticleNotification();
//     },
//   });
// };
</script>

<template>
  <Card>
    <template #content>
      <form class="flex flex-col gap-y-3">
        <div v-if="isNew" class="flex justify-center mb-3 py-1.5 bg-green-100">NEU</div>
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
              rows="3"
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
            icon="pi pi-save"
            text
            rounded
            aria-label="Artikeländerung speichern"
          />
          <Button
            @click="confirmDelete"
            v-if="!isNew"
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
