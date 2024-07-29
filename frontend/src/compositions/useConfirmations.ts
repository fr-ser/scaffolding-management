import { useConfirm } from "primevue/useconfirm";
export default function useConfirmation () {
const confirm = useConfirm();

const showDeleteOrderConfirmation = () => {
confirm.require({
    message: "Sind Sie sich sicher, dass der Auftrag gelöscht werden soll?",
    header: "Bestätigung",
    rejectLabel: "Abbrechen",
    rejectClass: "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
    acceptLabel: "Löschen",
    accept: 
})
}
}
