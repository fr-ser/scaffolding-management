import { deleteOrder, isAppErrorCode } from "@/backendClient";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { ArticleKind } from "@/global/types/appTypes";
import { ErrorCode } from "@/global/types/backendTypes";
import type {
  InvoiceCreate,
  InvoiceUpdate,
  OfferCreate,
  OfferUpdate,
  OrderCreate,
  OrderUpdate,
  OverdueNoticeCreate,
  OverdueNoticeUpdate,
} from "@/global/types/dataEditTypes";
import type { OrderItem } from "@/global/types/entities";
import { ValidationError, replaceEmptyStringsWithNull } from "@/helpers/utils";

export default function useOrderLogic() {
  const notifications = useNotifications();
  const confirm = useConfirmations();

  return {
    async deleteOrderWithConfirmation(orderId: string): Promise<boolean> {
      const confirmationResult = await confirm.showConfirmation(
        "Sind Sie sich sicher, dass der Auftrag gelöscht werden soll?",
      );
      if (!confirmationResult) return false;

      try {
        await deleteOrder(orderId);
      } catch (error) {
        if (isAppErrorCode(error, ErrorCode.FK_CONSTRAINT_DOCUMENT)) {
          notifications.showNotification(
            "Es müssen zuerst die Dokumente des Auftrags gelöscht werden bevor der Auftrag gelöscht werden kann.",
            "error",
            6000,
          );
        } else {
          notifications.showNotification("Der Auftrag konnte nicht gelöscht werden.", "error");
        }
        return false;
      }
      notifications.showNotification("Der Auftrag wurde gelöscht");
      return true;
    },
  };
}

export function useOrderValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload<T extends OrderCreate | OrderUpdate>(data: T): T {
      const cleaned = replaceEmptyStringsWithNull(data);

      if (!cleaned.title) {
        notifications.showNotification("Ein Titel ist nötig", "error");
        throw new ValidationError();
      }

      if (!cleaned.client_id) {
        notifications.showNotification("Ein Kunde ist nötig", "error");
        throw new ValidationError();
      }

      return cleaned;
    },
  };
}

export function useOfferValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload<T extends OfferUpdate | OfferCreate>(data: T): T {
      if (!data.items || data.items.length === 0) {
        notifications.showNotification("Mindestens eine Position ist nötig", "error");
        throw new ValidationError();
      }

      const cleanedItems = data.items.map(replaceEmptyStringsWithNull);
      const cleaned = { ...replaceEmptyStringsWithNull(data), items: cleanedItems };

      validateOfferOrInvoiceItems(cleaned.items, notifications);

      return cleaned;
    },
  };
}

export function useInvoiceValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload<T extends InvoiceUpdate | InvoiceCreate>(data: T): T {
      if (!data.items || data.items.length === 0) {
        notifications.showNotification("Mindestens eine Position ist nötig", "error");
        throw new ValidationError();
      }

      const cleanedItems = data.items.map(replaceEmptyStringsWithNull);
      const cleaned = { ...replaceEmptyStringsWithNull(data), items: cleanedItems };

      if (!cleaned.service_dates || cleaned.service_dates.length === 0) {
        notifications.showNotification("Mindestens ein Leistungsdatum ist nötig", "error");
        throw new ValidationError();
      }

      validateOfferOrInvoiceItems(cleaned.items, notifications);

      return cleaned;
    },
  };
}

function validateOfferOrInvoiceItems(
  items: Omit<OrderItem, "id">[],
  notifications: ReturnType<typeof useNotifications>,
) {
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex];
    if (!item.title) {
      notifications.showNotification(`Position ${itemIndex + 1}: Ein Titel ist nötig`, "error");
      throw new ValidationError();
    }

    if (!item.description) {
      notifications.showNotification(
        `Position ${itemIndex + 1}: Eine Beschreibung ist nötig`,
        "error",
      );
      throw new ValidationError();
    }

    if (item.kind === ArticleKind.item && (!item.unit || !item.amount || !item.price)) {
      notifications.showNotification(
        `Position ${itemIndex + 1}: Ein Artikel muss Anzahl, Preis und Einheit haben`,
        "error",
      );
      throw new ValidationError();
    }
  }
}

export function useOverdueNoticeValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload<T extends OverdueNoticeCreate | OverdueNoticeUpdate>(data: T): T {
      if (!data.invoice_documents || data.invoice_documents.length === 0) {
        notifications.showNotification("Mindestens ein Rechnungsdokument ist nötig", "error");
        throw new ValidationError();
      }

      const cleaned = replaceEmptyStringsWithNull(data);

      return cleaned;
    },
  };
}

export function getBaseOfferAndInvoiceItem() {
  return {
    kind: ArticleKind.heading,
    title: "Hinweis Standmiete",
    description: "Bei Verlängerung über vier Wochen berechnen wir 10% von der Nettosumme pro KW.",
  };
}
