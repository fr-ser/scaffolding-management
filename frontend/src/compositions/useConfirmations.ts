import { useConfirm } from "primevue/useconfirm";

export default function useConfirmation() {
  const confirm = useConfirm();

  const showDeleteOrderConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Sind Sie sich sicher, dass der Auftrag gelöscht werden soll?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Löschen",
      accept: acceptCallback,
    });
  };
  const showDeleteClientConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Sind Sie sich sicher, dass der Kunde gelöscht werden soll?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Löschen",
      accept: acceptCallback,
    });
  };

  const showDeleteArticleConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Sind Sie sich sicher, dass der Artikel gelöscht werden soll?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Löschen",
      accept: acceptCallback,
    });
  };

  return {
    showDeleteOrderConfirmation,
    showDeleteClientConfirmation,
    showDeleteArticleConfirmation,
  };
}
