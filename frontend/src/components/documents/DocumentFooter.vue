<script setup>
const VITE_COMPANY_OWNER = import.meta.env.VITE_COMPANY_OWNER;
const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
const VITE_COMPANY_STREET_AND_NUMBER = import.meta.env.VITE_COMPANY_STREET_AND_NUMBER;
const VITE_COMPANY_POSTAL_CODE_AND_CITY = import.meta.env.VITE_COMPANY_POSTAL_CODE_AND_CITY;
const VITE_COMPANY_VAT_CODE = import.meta.env.VITE_COMPANY_VAT_CODE;
const VITE_COMPANY_TAX_CODE = import.meta.env.VITE_COMPANY_TAX_CODE;
const VITE_COMPANY_PHONE = import.meta.env.VITE_COMPANY_PHONE;
const VITE_COMPANY_MOBILE_PHONE = import.meta.env.VITE_COMPANY_MOBILE_PHONE;
const VITE_COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const VITE_COMPANY_BANK_NAME_1 = import.meta.env.VITE_COMPANY_BANK_NAME_1;
const VITE_COMPANY_IBAN_1 = import.meta.env.VITE_COMPANY_IBAN_1;
const VITE_COMPANY_BIC_1 = import.meta.env.VITE_COMPANY_BIC_1;
const VITE_COMPANY_BANK_NAME_2 = import.meta.env.VITE_COMPANY_BANK_NAME_2;
const VITE_COMPANY_IBAN_2 = import.meta.env.VITE_COMPANY_IBAN_2;
const VITE_COMPANY_BIC_2 = import.meta.env.VITE_COMPANY_BIC_2;
const VITE_COMPANY_HOMEPAGE = import.meta.env.VITE_COMPANY_HOMEPAGE;
</script>

<template>
  <section class="text-xs">
    <hr class="border-black border-1 mb-3" />
    <div class="grid grid-cols-4 grid-rows-1 gap-1">
      <div>
        <p class="font-bold">{{ VITE_COMPANY_NAME }}</p>
        <p>{{ VITE_COMPANY_STREET_AND_NUMBER }}</p>
        <p>{{ VITE_COMPANY_POSTAL_CODE_AND_CITY }}</p>
        <p>St-Nr: {{ VITE_COMPANY_TAX_CODE }}</p>
        <p>USt-Id: {{ VITE_COMPANY_VAT_CODE }}</p>
      </div>
      <div>
        <p class="font-bold">Kontaktinformation</p>
        <p>{{ VITE_COMPANY_OWNER }}</p>
        <p>Phone: {{ VITE_COMPANY_PHONE }}</p>
        <p>Mobil: {{ VITE_COMPANY_MOBILE_PHONE }}</p>
        <p>E-Mail: {{ VITE_COMPANY_EMAIL }}</p>
      </div>
      <div class="col-span-2 flex flex-col">
        <p class="font-bold self-center">Bankverbindung</p>
        <div class="flex flex-row">
          <div class="first-bank-block">
            <p>{{ VITE_COMPANY_BANK_NAME_1 }}</p>
            <p>IBAN: {{ VITE_COMPANY_IBAN_1 }}</p>
            <p>BIC: {{ VITE_COMPANY_BIC_1 }}</p>
          </div>
          <div>
            <p>{{ VITE_COMPANY_BANK_NAME_2 }}</p>
            <p>IBAN: {{ VITE_COMPANY_IBAN_2 }}</p>
            <p>BIC: {{ VITE_COMPANY_BIC_2 }}</p>
          </div>
        </div>
        <p class="self-center">Web: {{ VITE_COMPANY_HOMEPAGE }}</p>
      </div>
    </div>
  </section>
</template>

<style>
.first-bank-block {
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px solid black;
}
</style>
