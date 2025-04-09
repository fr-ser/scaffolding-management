import { showGlobalErrorToast } from "./composables/useNotifications";
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

app.use(PrimeVue, { unstyled: true, pt: Lara });

app.use(createPinia());
app.use(router);

function errorHandler(err: unknown) {
  showGlobalErrorToast("Ein Fehler ist aufgetreten: " + String(err));
}

app.config.errorHandler = errorHandler;

// rejected promises do not go to Vue and need to be caught like this
window.addEventListener("unhandledrejection", (event) => {
  errorHandler(event.reason);
});

app.mount("#app");
