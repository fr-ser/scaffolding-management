import type { ToastMessageOptions } from "primevue/toast";
import type { ToastServiceMethods } from "primevue/toastservice";
import { useToast } from "primevue/usetoast";
import type { Ref } from "vue";

export default function useNotifications() {
  const toast = useToast();

  return {
    showNotification(
      summary: string,
      severity: ToastMessageOptions["severity"] = "info",
      duration: number = 3000,
    ) {
      toast.add({ severity, summary, life: duration, group: "global" });
    },
  };
}

let toastRef: Ref<ToastServiceMethods | undefined> | null = null;

export function setGlobalToastRef(ref: Ref<ToastServiceMethods | undefined>) {
  toastRef = ref;
}

/**
 * This methods allows showing a toast message outside the Vue context
 */
export function showGlobalErrorToast(summary: string) {
  const toastService = toastRef?.value;
  if (!toastService) {
    console.warn("not toast ref found");
    alert(summary);
    return;
  }
  toastService.add({ summary, severity: "error" });
}
