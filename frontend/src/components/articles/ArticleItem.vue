<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
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
</script>

<template>
  <Card>
    <template #content>
      <div v-if="isNew" class="flex justify-center mb-3 py-1.5 bg-green-100">NEU</div>
      <form class="flex flex-row flex-wrap gap-x-3 gap-y-6 pt-4">
        <div class="min-w-72 grow flex flex-col gap-6">
          <FloatLabel>
            <InputText id="titel" v-model="editableArticle.title" class="w-full" />
            <label for="titel">Titel</label>
          </FloatLabel>
          <FloatLabel>
            <Textarea
              id="text"
              v-model="editableArticle.description"
              class="w-full"
              autoResize
              rows="7"
              cols="30"
            />
            <label for="text">Bezeichnung</label>
          </FloatLabel>
        </div>
        <div class="grow md:grow-0 min-w-72 flex flex-col flex-wrap justify-end gap-6">
          <FloatLabel>
            <!-- The following warning is logged in the browser console:
              "Incorrect use of <label for=FORM_ELEMENT>"
              It is because of this outstanding bug: 
              https://github.com/primefaces/primevue/issues/2924
              -->
            <Dropdown
              v-model="editableArticle.kind"
              :options="articlesType"
              class="w-full"
              id="article-kind"
            />
            <label for="article-kind">Art</label>
          </FloatLabel>
          <FloatLabel>
            <InputText class="w-full" id="unit" v-model="editableArticle.unit" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel class="grow">
            <InputNumber
              class="w-full"
              inputId="price"
              v-model="editableArticle.price"
              data-testid="price-input"
            />
            <label for="price">Preis</label>
          </FloatLabel>
          <div class="flex flex-row flex-wrap justify-end">
            <Button
              @click="confirmDelete"
              v-if="!isNew"
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              aria-label="Artikel löschen"
              data-testid="article-delete-button"
            />
            <Button
              @click="onUpdateArticle"
              icon="pi pi-save"
              text
              rounded
              aria-label="Artikel speichern"
              data-testid="article-save-button"
            />
          </div>
        </div>
      </form>
    </template>
  </Card>
</template>
