import useNotifications from "@/composables/useNotifications";
import { ArticleKind } from "@/global/types/appTypes";
import type { Article } from "@/global/types/entities";
import { ValidationError } from "@/helpers/utils";

export function useArticleValidation() {
  const notifications = useNotifications();

  return {
    validateAndCleanPayload(data: Article): Article {
      const cleaned: Article = { ...data };

      for (const key in cleaned) {
        const typedKey = key as keyof Article;

        if (cleaned[typedKey] === "") {
          (cleaned[typedKey] as any) = null;
        }
      }

      if (
        cleaned.kind === ArticleKind.heading &&
        (Boolean(cleaned.unit) || Boolean(cleaned.price))
      ) {
        notifications.showNotification("Ein Hinweis kann keinen Preis oder Einheit haben", "error");
        throw new ValidationError();
      }

      if (!cleaned.title) {
        notifications.showNotification("Ein Titel ist nötig", "error");
        throw new ValidationError();
      }

      if (!cleaned.description) {
        notifications.showNotification("Eine Beschreibung ist nötig", "error");
        throw new ValidationError();
      }

      return cleaned;
    },
  };
}
