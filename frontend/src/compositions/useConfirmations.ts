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
  const showUpdateOfferStatusConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Möchten Sie den Angebotsstatus wirklich aktualisieren?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showUpdateInvoiceStatusConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Soll der Rechnungsstatus aktualisiert werden?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showUpdateOverduePaymentStatusConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Do you want to change the payment status?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showUpdateOverdueNoticeLevelConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Do you want to change the notice level?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showCreatePdfConfirmation = (acceptCallback: () => void, array: string[]) => {
    confirm.require({
      message: ` "Wollen Sie für die folgenden Dokumente eine PDF-Datei erstellen: ${array.join(", ")}?"`,
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  return {
    showDeleteOrderConfirmation,
    showDeleteClientConfirmation,
    showDeleteArticleConfirmation,
    showUpdateOfferStatusConfirmation,
    showUpdateInvoiceStatusConfirmation,
    showUpdateOverduePaymentStatusConfirmation,
    showUpdateOverdueNoticeLevelConfirmation,
    showCreatePdfConfirmation,
  };
}
