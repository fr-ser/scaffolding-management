import useNotifications from "@/composables/useNotifications";
import type { ClientCreate, ClientUpdate } from "@/global/types/dataEditTypes";
import { ValidationError, trimStringsAndReplaceEmptyWithNull } from "@/helpers/utils";

export function useClientValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload(data: ClientCreate | ClientUpdate) {
      const cleaned = trimStringsAndReplaceEmptyWithNull(data);

      if (!cleaned.first_name && !cleaned.last_name && !cleaned.company_name) {
        notifications.showNotification("Ein Personen- oder Firmenname ist erforderlich", "error");
        throw new ValidationError();
      }

      const country = cleaned.country || "DE";
      const reverse_vat = Boolean(cleaned.reverse_vat);

      return {
        ...cleaned,
        country,
        reverse_vat,
      };
    },
  };
}
