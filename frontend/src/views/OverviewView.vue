<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import SplitButton from "primevue/splitbutton";
import { onMounted, ref, watch } from "vue";

import { getOrders } from "@/backendClient";
import ArticleSearch from "@/components/overview/ArticleSearch.vue";
import CashDiscountSearch from "@/components/overview/CashDiscountSearch.vue";
import ClientSearch from "@/components/overview/ClientSearch.vue";
import DateSearch from "@/components/overview/DateSearch.vue";
import OfferStatusSearch from "@/components/overview/OfferStatusSearch.vue";
import OrderStatusSearch from "@/components/overview/OrderStatusSearch.vue";
import OverdueSearch from "@/components/overview/OverdueSearch.vue";
import OverdueStatusSearch from "@/components/overview/OverdueStatusSearch.vue";
import PaymentStatusSearch from "@/components/overview/PaymentStatusSearch.vue";
import { formatIsoDateString } from "@/global/helpers";
import {
  OfferStatus,
  OrderStatus,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "@/global/types/appTypes";
import type { Article, Client, Order } from "@/global/types/entities";
import { ROUTES } from "@/router";

type FilterDate = Date | null | undefined;

interface SearchFilters {
  client: { active: boolean; value: Client | null | undefined };
  article: { active: boolean; value: Article | null | undefined };
  orderStatus: { active: boolean; value: OrderStatus | null | undefined };
  invoiceDate: { active: boolean; value: [FilterDate, FilterDate] };
  offerDate: { active: boolean; value: [FilterDate, FilterDate] };
  overdueDate: { active: boolean; value: [FilterDate, FilterDate] };
  cashDiscount: { active: boolean; value: String | null | undefined };
  serviceDate: { active: boolean; value: [FilterDate, FilterDate] };
  invoicePaymentTerm: { active: boolean; value: [FilterDate, FilterDate] };
  invoicePaymentStatus: { active: boolean; value: PaymentStatus | null | undefined };
  offerValidity: { active: boolean; value: [FilterDate, FilterDate] };
  offerStatus: { active: boolean; value: OfferStatus | null | undefined };
  overdueNoticeLevel: { active: boolean; value: OverdueNoticeLevel | null | undefined };
  overduePaymentTerm: { active: boolean; value: [FilterDate, FilterDate] };
  overdueStatus: { active: boolean; value: OverdueNoticePaymentStatus | null | undefined };
}

const ordersList = ref<Order[]>([]);
const search = ref<string>("");
let filters = ref<SearchFilters>({
  client: { active: false, value: null },
  article: { active: false, value: null },
  orderStatus: { active: false, value: null },
  invoiceDate: { active: false, value: [null, null] },
  offerDate: { active: false, value: [null, null] },
  overdueDate: { active: false, value: [null, null] },
  serviceDate: { active: false, value: [null, null] },
  cashDiscount: { active: false, value: null },
  invoicePaymentTerm: { active: false, value: [null, null] },
  invoicePaymentStatus: { active: false, value: null },
  offerValidity: { active: false, value: [null, null] },
  offerStatus: { active: false, value: null },
  overdueNoticeLevel: { active: false, value: null },
  overduePaymentTerm: { active: false, value: [null, null] },
  overdueStatus: { active: false, value: null },
});

const items = [
  {
    label: "Client search",
    command: () => {
      makeFilterVisible("client");
    },
  },
  {
    label: "Article search",
    command: () => {
      makeFilterVisible("article");
    },
  },
  {
    label: "Order status search",
    command: () => {
      makeFilterVisible("orderStatus");
    },
  },
  {
    label: "Invoice date search",
    command: () => {
      makeFilterVisible("invoiceDate");
    },
  },
  {
    label: "Offer date search",
    command: () => {
      makeFilterVisible("offerDate");
    },
  },
  {
    label: "Overdue date search",
    command: () => {
      makeFilterVisible("overdueDate");
    },
  },
  {
    label: "Service date search",
    command: () => {
      makeFilterVisible("serviceDate");
    },
  },
  {
    label: "Cash discount search",
    command: () => {
      makeFilterVisible("cashDiscount");
    },
  },
  {
    label: "Invoice payment Term",
    command: () => {
      makeFilterVisible("invoicePaymentTerm");
    },
  },
  {
    label: "Invoice payment Status",
    command: () => {
      makeFilterVisible("invoicePaymentStatus");
    },
  },
  {
    label: "Gültigkeit(Angebot)",
    command: () => {
      makeFilterVisible("offerValidity");
    },
  },
  {
    label: "Offer status",
    command: () => {
      makeFilterVisible("offerStatus");
    },
  },
  {
    label: "Overdue Notice level",
    command: () => {
      makeFilterVisible("overdueNoticeLevel");
    },
  },
  {
    label: "Zahlungziel (Mahnung)",
    command: () => {
      makeFilterVisible("overduePaymentTerm");
    },
  },
  {
    label: "Overdue status search",
    command: () => {
      makeFilterVisible("overdueStatus");
    },
  },
];
async function reloadPage() {
  // TODO: use pagination
  ordersList.value = (await getOrders({ query: search.value })).data;
}
function makeFilterVisible(
  name:
    | "client"
    | "article"
    | "orderStatus"
    | "invoiceDate"
    | "offerDate"
    | "overdueDate"
    | "serviceDate"
    | "cashDiscount"
    | "invoicePaymentTerm"
    | "invoicePaymentStatus"
    | "offerValidity"
    | "offerStatus"
    | "overdueNoticeLevel"
    | "overduePaymentTerm"
    | "overdueStatus",
) {
  filters.value[name].active = true;
}
function findClient(item: Client | undefined) {
  filters.value.client.value = item;
}

function findArticle(item: Article | undefined) {
  filters.value.article.value = item;
}

function findOrderStatus(item: OrderStatus | undefined) {
  filters.value.orderStatus.value = item;
}
function findDate(dateFrom: Date | undefined, dateAfter: Date | undefined, dateId: string) {
  switch (dateId) {
    case "invoiceDate":
      filters.value.invoiceDate.value = [dateFrom, dateAfter];
      break;
    case "offerDate":
      filters.value.offerDate.value = [dateFrom, dateAfter];

      break;
    case "overdueDate":
      filters.value.overdueDate.value = [dateFrom, dateAfter];
      break;
    case "serviceDate":
      filters.value.serviceDate.value = [dateFrom, dateAfter];
      break;
    case "offerValidity":
      filters.value.offerValidity.value = [dateFrom, dateAfter];

      break;
    case "overduePaymentTerm":
      filters.value.overduePaymentTerm.value = [dateFrom, dateAfter];
      break;
  }
}
function findCashDiscount(item: String | undefined) {
  filters.value.cashDiscount.value = item;
}
function findInvoicePaymentStatus(item: PaymentStatus | undefined) {
  filters.value.invoicePaymentStatus.value = item;
}
function findOfferStatus(item: OfferStatus | undefined) {
  filters.value.offerStatus.value = item;
}
function findOverdueNoticeLevel(item: OverdueNoticeLevel | undefined) {
  filters.value.overdueNoticeLevel.value = item;
}
function findOverdueStatus(item: OverdueNoticePaymentStatus | undefined) {
  filters.value.overdueStatus.value = item;
}
watch(
  filters,
  () => {
    console.log(filters.value);
  },
  { deep: true },
);
onMounted(async () => {
  reloadPage();
});
</script>
<template>
  <div class="flex flex-col overflow-hidden">
    <div class="card flex w-full gap-x-6 mb-3">
      <span class="relative grow">
        <i
          class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
        />
        <InputText v-model="search" placeholder="Suche" class="pl-10 w-full" />
      </span>

      <Button icon="pi pi-times" size="small" severity="danger" rounded />
    </div>
    <div class="font-bold">Filterregeln:</div>
  </div>
  <SplitButton label="Options" :model="items" :class="'w-full'" />
  <section class="flex flex-col sm:flex-row gap-4 sm:gap-4 Class Properties flex-wrap">
    <ClientSearch v-if="filters.client.active" @find-client="findClient"></ClientSearch>
    <ArticleSearch v-if="filters.article.active" @find-article="findArticle"></ArticleSearch>
    <OrderStatusSearch
      v-if="filters.orderStatus.active"
      @find-order-status="findOrderStatus"
    ></OrderStatusSearch>
    <DateSearch
      v-if="filters.invoiceDate.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'invoiceDate');
        }
      "
      :title="'Rechnungsdaten'"
    ></DateSearch>
    <DateSearch
      v-if="filters.offerDate.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'offerDate');
        }
      "
      :title="'Angebotsdaten'"
      id="offerDate"
    ></DateSearch>
    <DateSearch
      v-if="filters.overdueDate.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'overdueDate');
        }
      "
      :title="'Mahnungsdatum'"
    ></DateSearch>
    <DateSearch
      v-if="filters.serviceDate.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'serviceDate');
        }
      "
      :title="'Leistungsdatum'"
    ></DateSearch>
    <CashDiscountSearch
      v-if="filters.cashDiscount.active"
      @find-cash-discount="findCashDiscount"
    ></CashDiscountSearch>
    <DateSearch
      v-if="filters.invoicePaymentTerm.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'invoicePaymentTerm');
        }
      "
      :title="'Zahlungziel(Rechnung)'"
    ></DateSearch>
    <PaymentStatusSearch
      v-if="filters.invoicePaymentStatus.active"
      @find-invoice-payment-status="findInvoicePaymentStatus"
    ></PaymentStatusSearch>
    <DateSearch
      v-if="filters.offerValidity.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'offerValidity');
        }
      "
      :title="'Gültigkeit(Angebot)'"
    ></DateSearch>
    <OfferStatusSearch
      v-if="filters.offerStatus.active"
      @find-offer-status="findOfferStatus"
    ></OfferStatusSearch>
    <OverdueSearch
      v-if="filters.overdueNoticeLevel.active"
      @find-overdue-notice-level="findOverdueNoticeLevel"
    ></OverdueSearch>
    <DateSearch
      v-if="filters.overduePaymentTerm.active"
      @find-date="
        (dateFrom, dateAfter) => {
          findDate(dateFrom, dateAfter, 'overduePaymentTerm');
        }
      "
      :title="'Zahlungziel (Mahnung)'"
      id="overduePaymentTerm"
    ></DateSearch>
    <OverdueStatusSearch
      v-if="filters.overdueStatus.active"
      @find-overdue-status="findOverdueStatus"
    ></OverdueStatusSearch>
  </section>
  <section v-for="order in ordersList" :key="order.id">
    <Card class="my-2">
      <template #content>
        <div class="flex flex-row justify-between items-center">
          <div>
            <router-link :to="`${ROUTES.ORDER.path}/${order.id}/edit`">
              <span class="font-bold">Auftrag:</span>
              {{
                `${order.client.street_and_number},  ${order.client.postal_code}  ${order.client.city} `
              }}
              <span class="font-bold"> - Kunde: </span
              >{{ ` ${order.client.first_name} ${order.client.last_name}` }}

              <i class="pi pi-external-link ml-1"></i>
            </router-link>
            <!-- ${order.offer} -->
            <ul class="list-disc pl-6 underline mt-3">
              <li class="underlined pb-2" v-if="order.offer">
                <router-link
                  :to="`${ROUTES.ORDER.path}/${order.id}/edit?sub_id=${order.offer.id}&sub_type=OFFER`"
                >
                  <span>Angebot vom: </span>{{ `${formatIsoDateString(order.offer.offered_at)}` }}
                  <span> - Angebotstatus: </span> {{ `${order.offer.status}` }}

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
              <li
                class="pb-2"
                v-show="order.invoices"
                v-for="item in order.invoices"
                :key="item.id"
              >
                <router-link
                  :to="`${ROUTES.ORDER.path}/${order.id}/edit?sub_id=${item.id}&sub_type=INVOICE`"
                >
                  <span>Rechnung vom: {{ formatIsoDateString(item.invoice_date) }}</span>
                  <span> -Zahlungstatus: {{ item.status }}</span>

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
              <li
                class="pb-2"
                v-show="order.overdue_notices"
                v-for="item in order.overdue_notices"
                :key="item.id"
              >
                <router-link
                  :to="`${ROUTES.ORDER.path}/${order.id}/edit?sub_id=${item.id}&sub_type=MAHNUNG`"
                >
                  <span>Mahnung vom: {{ formatIsoDateString(item.notice_date) }}</span>
                  <span>-Zahlungstatus: {{ item.payment_status }} </span>

                  <i class="pi pi-external-link ml-1"></i>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Card>
  </section>
</template>
