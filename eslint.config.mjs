import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".venv/**",
      "services/agent-runtime/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier
);
