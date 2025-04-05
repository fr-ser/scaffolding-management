import { config } from "@vue/test-utils";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";

config.global.plugins = [ToastService, ConfirmationService];
config.global.renderStubDefaultSlot = true;
