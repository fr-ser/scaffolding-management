import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "frontend/**",
      "backend/**",
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
    ],
  },
  {
    files: ["tests/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierRecommended],
  },
);
