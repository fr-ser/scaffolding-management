import { useConfirm } from "primevue/useconfirm";

export default function useConfirmations() {
  const confirm = useConfirm();

  return {
    async showConfirmation(message: string) {
      return new Promise((resolve) => {
        confirm.require({
          message,
          header: "Bestätigung",
          rejectLabel: "Abbrechen",
          rejectClass:
            "bg-transparent border text-red-500 border border-red-500 hover:bg-red-300/10",
          acceptLabel: "Bestätigen",
          accept: () => resolve(true),
          reject: () => resolve(false),
        });
      });
    },
  };
}
