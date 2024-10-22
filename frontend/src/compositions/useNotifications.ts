import { useToast } from "primevue/usetoast";

export default function useNotifications() {
  const toast = useToast();

  const showDeleteClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Kunde wurde gelöscht",
      life: 3000,
    });
  };

  const showUpdateClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Die Änderung der Kundendaten wurde gespeichert",
      life: 3000,
    });
  };
  const showCreateClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Ein neuer Kunde wurde erstellt",
      life: 3000,
    });
  };
  const showCreateArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Ein neuer Artikel wurde erstellt",
      life: 3000,
    });
  };
  const showUpdateArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Die Änderungen wurden gespeichert",
      life: 3000,
    });
  };
  const showDeleteArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Artikel wurde gelöscht",
      life: 3000,
    });
  };

  const showCreateOrderNotification = () => {
    toast.add({
      severity: "info",
      summary: "Ein neuer Auftrag wurde erstellt",
      life: 3000,
    });
  };
  const showDeleteOrderNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Auftrag wurde gelöscht",
      life: 3000,
    });
  };
  const showUpdateOrderNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Auftrag wurde gespeichert",
      life: 3000,
    });
  };
  const showUpdateOfferStatusNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Status wurde gespeichert",
      life: 3000,
    });
  };
  const showCreateInvoiceNotification = () => {
    toast.add({
      severity: "info",
      summary: "Eine neue Rechung wurde erstellt",
      life: 3000,
    });
  };
  const showUpdateInvoiceStatusNotification = () => {
    toast.add({
      severity: "info",
      summary: "Die Rechnung wurde aktualisiert",
      life: 3000,
    });
  };
  const showCreateOverdueNotification = () => {
    toast.add({
      severity: "info",
      summary: "Eine neue Mahnung wurde erstellt",
      life: 3000,
    });
  };
  const showUpdateOverdueNoticeLevelNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Mahnungslevel wurde geändert",
      life: 3000,
    });
  };
  const showUpdateOverduePaymentStatusNotification = () => {
    toast.add({
      severity: "info",
      summary: "Der Status wurde geändert",
      life: 3000,
    });
  };
  const showCreatePdfDocumentNotification = () => {
    toast.add({
      severity: "info",
      summary: "Pdf document was created",
      life: 3000,
    });
  };
  const showCreateNewDocumentNotification = () => {
    toast.add({
      severity: "info",
      summary: "New document was created",
      life: 3000,
    });
  };
  return {
    showDeleteClientNotification,
    showUpdateClientNotification,
    showCreateClientNotification,
    showUpdateArticleNotification,
    showDeleteArticleNotification,
    showCreateArticleNotification,
    showCreateOrderNotification,
    showDeleteOrderNotification,
    showUpdateOrderNotification,
    showUpdateOfferStatusNotification,
    showCreateInvoiceNotification,
    showUpdateInvoiceStatusNotification,
    showCreateOverdueNotification,
    showUpdateOverdueNoticeLevelNotification,
    showUpdateOverduePaymentStatusNotification,
    showCreatePdfDocumentNotification,
    showCreateNewDocumentNotification,
  };
}
