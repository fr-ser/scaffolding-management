import type { ToastMessageOptions } from "primevue/toast";
import { useToast } from "primevue/usetoast";

export default function useNotifications() {
  const toast = useToast();

  return {
    showNotification(summary: string, severity: ToastMessageOptions["severity"] = "info") {
      toast.add({ severity, summary, life: 3000, group: "global" });
    },
  };
}
