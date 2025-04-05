import useNotifications from "@/composables/useNotifications";
import type { ClientCreate, ClientUpdate } from "@/global/types/dataEditTypes";
import { ValidationError } from "@/helpers/utils";

export function useClientValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanClientPayload<T extends ClientCreate | ClientUpdate>(data: T): T {
      if (!data.first_name && !data.last_name && !data.company_name) {
        notifications.showNotification("Ein Personen- oder Firmenname ist erforderlich", "error");
        throw new ValidationError();
      }
      const cleaned = { ...data };

      for (const key in cleaned) {
        if (cleaned[key] === "") {
          cleaned[key] = null as any;
        }
      }

      return cleaned;
    },
  };
}
