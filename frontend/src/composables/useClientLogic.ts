import useNotifications from "@/composables/useNotifications";
import type { ClientCreate, ClientUpdate } from "@/global/types/dataEditTypes";
import { ValidationError, replaceEmptyStringsWithNull } from "@/helpers/utils";

export function useClientValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload<T extends ClientCreate | ClientUpdate>(data: T): T {
      const cleaned = replaceEmptyStringsWithNull(data);

      if (!cleaned.first_name && !cleaned.last_name && !cleaned.company_name) {
        notifications.showNotification("Ein Personen- oder Firmenname ist erforderlich", "error");
        throw new ValidationError();
      }

      return cleaned;
    },
  };
}
