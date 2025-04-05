import { deleteOrder, isAppErrorCode } from "@/backendClient";
import useConfirmations from "@/composables/useConfirmations";
import useNotifications from "@/composables/useNotifications";
import { ErrorCode } from "@/global/types/backendTypes";

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
