import { useToast } from "primevue/usetoast";

export default function useNotifications() {
    const toast = useToast();

    const showDeleteClientNotification = () => {
        toast.add({
            severity: "info",
            summary: "Confirmed",
            detail: "You have deleted this client",
            life: 3000,
          });
    }

    const showUpdateClientNotification = () => {
        toast.add({ severity: "info", summary: "Info", detail: "Client was updated", life: 3000 });
       
    }
    const showCreateClientNotification = () => {
        toast.add({ severity: "info", summary: "Info", detail: "Client was created", life: 3000 });
    }
    const  showUpdateArticleNotification = () => {
        toast.add({ severity: "info", summary: "Info", detail: "Article was updated", life: 3000 });
    }
    const showDeleteArticleNotification = () => {
        toast.add({
            severity: "info",
            summary: "Confirmed",
            detail: "You have deleted this article",
            life: 3000,
          });
    }

    return {
        showDeleteClientNotification,
        showUpdateClientNotification,
        showCreateClientNotification, 
        showUpdateArticleNotification, 
        showDeleteArticleNotification, 
    }
}
