import { useToast } from "primevue/usetoast";

export default function useNotifications() {
  const toast = useToast();

  const showDeleteClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Information",
      detail: "Der Kunde wurde gelöscht",
      life: 3000,
    });
  };

  const showUpdateClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Info",
      detail: "Die Änderung der Kundendaten wurde gespeichert",
      life: 3000,
    });
  };
  const showCreateClientNotification = () => {
    toast.add({
      severity: "info",
      summary: "Info",
      detail: "Ein neuer Kunde wurde erstellt",
      life: 3000,
    });
  };
  const showCreateArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Info",
      detail: "Ein neuer Artikel wurde erstellt",
      life: 3000,
    });
  };
  const showUpdateArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Information",
      detail: "Die Änderungen wurden gespeichert",
      life: 3000,
    });
  };
  const showDeleteArticleNotification = () => {
    toast.add({
      severity: "info",
      summary: "Bestätigung",
      detail: "Der Artikel wurde gelöscht",
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
  };
}
