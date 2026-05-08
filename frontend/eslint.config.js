import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  { ignores: ["*.d.ts", "**/dist", "src/presets/**"] },
  {
    files: ["**/*.{ts,vue}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs["flat/essential"],
      prettierRecommended,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
);
