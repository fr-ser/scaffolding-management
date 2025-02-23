import { useConfirm } from "primevue/useconfirm";

export default function useConfirmation() {
  const confirm = useConfirm();

  return {
    showConfirmation(message: string, acceptCallback: () => void) {
      confirm.require({
        message,
        header: "Bestätigung",
        rejectLabel: "Abbrechen",
        rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
        acceptLabel: "Bestätigen",
        accept: acceptCallback,
      });
    },
  };
}
