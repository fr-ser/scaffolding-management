import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**", "backend/**", "frontend/**"],
  },
});
