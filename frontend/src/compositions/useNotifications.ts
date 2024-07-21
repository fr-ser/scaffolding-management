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

    const showUpdateClientNotification = () => {}
    const showCreateClientNotification = () => {}

    return {
        showDeleteClientNotification,
        showUpdateClientNotification,
        showCreateClientNotification
    }
}
