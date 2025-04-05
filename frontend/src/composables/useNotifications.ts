import type { ToastMessageOptions } from "primevue/toast";
import { useToast } from "primevue/usetoast";

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
