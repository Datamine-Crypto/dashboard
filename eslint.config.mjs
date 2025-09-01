// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: ["**/build/"],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React rules
  {
    ...reactRecommended,
    files: ["**/*.{js,jsx,ts,tsx}"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Custom rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
        "no-empty-pattern": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off",
        "eqeqeq": "off",
        "no-mixed-operators": "off",
        "jsx-a11y/alt-text": "off",
        "no-throw-literal": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-case-declarations": "off",
        "react/prop-types": "off",
        "react/display-name": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "react/no-unescaped-entities": "off",
        "no-constant-condition": "off",
    },
  },

  // Prettier config (must be last)
  prettierConfig
);
