import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  { ignores: ["node_modules/**", "test-results/**", "playwright-report/**", "blob-report/**"] },
  {
    files: ["tests/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierRecommended],
  },
);
