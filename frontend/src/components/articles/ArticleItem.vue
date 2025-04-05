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
import { useArticleValidation } from "@/composables/useArticleLogic";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";

const emit = defineEmits(["reloadArticleView"]);

const props = defineProps<{
  article: Article;
  isNew?: boolean;
}>();

const confirm = useConfirmations();
const notifications = useNotifications();

const editableArticle = ref(props.article);

const validation = useArticleValidation();

const onClickSave = async () => {
  const payload = validation.validateAndCleanPayload(editableArticle.value);

  if (props.isNew) {
    await createArticle(payload);
    notifications.showNotification("Ein neuer Artikel wurde erstellt");
    emit("reloadArticleView");
  } else {
    await updateArticle(`${payload.id}`, payload);
    notifications.showNotification("Die Änderungen wurden gespeichert");
  }
};

async function onClickDelete() {
  const confirmationResult = await confirm.showConfirmation(
    "Sind Sie sich sicher, dass der Artikel gelöscht werden soll?",
  );
  if (!confirmationResult) return;

  try {
    await deleteArticle(`${editableArticle.value.id}`);
    emit("reloadArticleView");
    notifications.showNotification("Der Artikel wurde gelöscht");
  } catch (error) {
    notifications.showNotification("Der Artikel konnte nicht gelöscht werden.", "error");
  }
}
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
            <Dropdown
              v-model="editableArticle.kind"
              :options="Object.values(ArticleKind)"
              class="w-full"
              id="article-kind"
              data-testid="article-kind-dropdown"
            />
            <label for="article-kind">Art</label>
          </FloatLabel>
          <FloatLabel>
            <InputText class="w-full" id="unit" v-model="editableArticle.unit" />
            <label for="unit">Einheit</label>
          </FloatLabel>
          <FloatLabel class="grow">
            <InputNumber
              locale="de-DE"
              :minFractionDigits="0"
              :maxFractionDigits="10"
              class="w-full"
              inputId="price"
              v-model="editableArticle.price"
              data-testid="price-input"
            />
            <label for="price">Preis</label>
          </FloatLabel>
          <div class="flex flex-row flex-wrap justify-end">
            <Button
              @click="onClickDelete"
              v-if="!isNew"
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              aria-label="Artikel löschen"
              data-testid="article-delete-button"
            />
            <Button
              @click="onClickSave"
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
