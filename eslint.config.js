import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "React.FC":
              "Useless and has some drawbacks\nSee https://github.com/facebook/create-react-app/pull/8177",
            "React.FunctionComponent":
              "Useless and has some drawbacks\nSee https://github.com/facebook/create-react-app/pull/8177",
            "React.FunctionalComponent":
              "Preact specific, useless and has some drawbacks\nSee https://github.com/facebook/create-react-app/pull/8177",
          },
        },
      ],
    },
  },
);
