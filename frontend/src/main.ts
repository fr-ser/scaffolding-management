import { showGlobalErrorToast } from "./composables/useNotifications";
import Lara from "@primeuix/themes/lara";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";

import App from "@/App.vue";
import "@/assets/main.css";
import router from "@/router";

const app = createApp(App);
app.use(ConfirmationService);
app.use(ToastService);

app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      cssLayer: {
        name: "primevue",
        order: "theme, base, primevue",
      },
    },
  },
});

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
