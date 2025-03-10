<script setup lang="ts">
import Menu from "primevue/menu";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getInvoiceDocument, getOfferDocument, getOverdueNoticeDocument } from "@/backendClient";
import DocumentArticleTable from "@/components/documents/DocumentArticleTable.vue";
import DocumentFooter from "@/components/documents/DocumentFooter.vue";
import DocumentInvoiceItemTable from "@/components/documents/DocumentInvoiceItemTable.vue";
import DocumentText from "@/components/documents/DocumentText.vue";
import DocumentTitle from "@/components/documents/DocumentTitle.vue";
import { neverFunction } from "@/global/helpers";
import { DocumentKind } from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  OfferDocument,
  OverdueNoticeDocument,
} from "@/global/types/entities";
import { getOrderEditPath } from "@/helpers/routes";

const router = useRouter();
const route = useRoute();
const kind = route.params.kind as DocumentKind;

let result = ref<OfferDocument | OverdueNoticeDocument | InvoiceDocument>();

const menuItems = ref([
  {
    label: "E-Mail-Versand",
    icon: "pi pi-envelope",
    command: function () {
      alert("email");
    },
  },
  {
    label: "Auftrag anzeigen",
    icon: "pi pi-shop",
    command: function () {
      if (result.value != null) {
        router.push(getOrderEditPath(result.value.order_id));
      }
    },
  },
]);

async function getDocument() {
  if (kind === DocumentKind.offer) {
    result.value = await getOfferDocument(route.params.id as string);
    return result;
  } else if (kind === DocumentKind.invoice) {
    result.value = await getInvoiceDocument(route.params.id as string);
    return result;
  } else if (kind === DocumentKind.overdueNotice) {
    result.value = await getOverdueNoticeDocument(route.params.id as string);
    return result;
  } else neverFunction(kind);
}

onMounted(async () => {
  await getDocument();
});
</script>

<template>
  <div class="w-full flex gap-2 flex-col-reverse lg:flex-row">
    <Menu :model="menuItems" />

    <div
      v-if="result"
      class="min-h-297 w-[60rem] px-[4rem] ml-auto mr-auto py-5 border-solid border-2 border-slate-500 box-border"
    >
      <DocumentTitle :result="result" :kind="kind" />
      <DocumentInvoiceItemTable
        v-if="kind === DocumentKind.overdueNotice"
        :document="result as OverdueNoticeDocument"
      />
      <DocumentArticleTable
        v-else
        :document="result as InvoiceDocument | OfferDocument"
        :kind="kind"
      />
      <DocumentText :result="result" :kind="kind" />
      <DocumentFooter />
    </div>
  </div>
</template>
