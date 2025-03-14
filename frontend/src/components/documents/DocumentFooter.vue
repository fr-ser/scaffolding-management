<script setup>
const VITE_COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME;
const VITE_COMPANY_STREET_AND_NUMBER = import.meta.env.VITE_COMPANY_STREET_AND_NUMBER;
const VITE_COMPANY_POSTAL_CODE_AND_CITY = import.meta.env.VITE_COMPANY_POSTAL_CODE_AND_CITY;
const VITE_COMPANY_VAT_CODE = import.meta.env.VITE_COMPANY_VAT_CODE;
const VITE_COMPANY_PHONE = import.meta.env.VITE_COMPANY_PHONE;
const VITE_COMPANY_MOBILE_PHONE = import.meta.env.VITE_COMPANY_MOBILE_PHONE;
const VITE_COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL;
const VITE_COMPANY_BANK_NAME = import.meta.env.VITE_COMPANY_BANK_NAME;
const VITE_COMPANY_IBAN = import.meta.env.VITE_COMPANY_IBAN;
const VITE_COMPANY_BIC = import.meta.env.VITE_COMPANY_BIC;
const VITE_COMPANY_HOMEPAGE = import.meta.env.VITE_COMPANY_HOMEPAGE;
</script>

<template>
  <section class="text-xs">
    <hr class="border-black border-1 mb-3" />
    <div class="flex flex-row justify-between">
      <div>
        <p class="font-bold">{{ VITE_COMPANY_NAME }}</p>
        <p>{{ VITE_COMPANY_STREET_AND_NUMBER }}</p>
        <p>{{ VITE_COMPANY_POSTAL_CODE_AND_CITY }}</p>
        <p>USt-Id: {{ VITE_COMPANY_VAT_CODE }}</p>
      </div>
      <div>
        <p class="font-bold">Kontaktinformation</p>
        <p>Phone: {{ VITE_COMPANY_PHONE }}</p>
        <p>Mobil: {{ VITE_COMPANY_MOBILE_PHONE }}</p>
        <p>E-Mail: {{ VITE_COMPANY_EMAIL }}</p>
        <p>Web: {{ VITE_COMPANY_HOMEPAGE }}</p>
      </div>
      <div class="col-span-2 flex flex-col">
        <p class="font-bold">Bankverbindung</p>
        <p>{{ VITE_COMPANY_BANK_NAME }}</p>
        <p>IBAN: {{ VITE_COMPANY_IBAN }}</p>
        <p>BIC: {{ VITE_COMPANY_BIC }}</p>
      </div>
    </div>
  </section>
</template>
