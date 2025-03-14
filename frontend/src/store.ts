import { defineStore } from "pinia";

import { getUserData } from "@/backendClient";
import { UserPermissions } from "@/global/types/backendTypes";

export const useUserStore = defineStore("user", {
  // by default we assume the user has all permissions as this is the most common user case
  state: () => ({ permissions: [...Object.values(UserPermissions)] }),
  actions: {
    async loadPermissions() {
      const result = await getUserData();
      this.permissions = result.permissions;
    },
  },
});
