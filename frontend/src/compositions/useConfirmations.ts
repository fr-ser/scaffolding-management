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
      message: "Wollen Sie den Zahlungsstatus ändern?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showUpdateOverdueNoticeLevelConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: "Wollen Sie den Mahnungslevel ändern?",
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showCreateMultiplePdfConfirmation = (acceptCallback: () => void, documentIds: string[]) => {
    confirm.require({
      message: `Wollen Sie für die folgenden Dokumente eine PDF-Datei erstellen: ${documentIds.join(", ")}?`,
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };
  const showCreateDocumentConfirmation = (acceptCallback: () => void) => {
    confirm.require({
      message: ` "Wollen Sie ein Dokument erstellen?"`,
      header: "Bestätigung",
      rejectLabel: "Abbrechen",
      rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
      acceptLabel: "Bestätigen",
      accept: acceptCallback,
    });
  };

  // TODO: delete all custom confirmations
  return {
    showDeleteOrderConfirmation,
    showDeleteClientConfirmation,
    showDeleteArticleConfirmation,
    showUpdateOfferStatusConfirmation,
    showUpdateInvoiceStatusConfirmation,
    showUpdateOverduePaymentStatusConfirmation,
    showUpdateOverdueNoticeLevelConfirmation,
    showCreateMultiplePdfConfirmation,
    showCreateDocumentConfirmation,

    getConfirmation: function (message: string, acceptCallback: () => void) {
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
