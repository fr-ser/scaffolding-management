import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";

import App from "@/App.vue";
import "@/assets/main.css";
import Lara from "@/presets/lara";
import router from "@/router";

const app = createApp(App);
app.use(ConfirmationService);
app.use(ToastService);

app.use(PrimeVue, {
  unstyled: true,
  pt: Lara,
});

app.use(createPinia());
app.use(router);

app.mount("#app");
