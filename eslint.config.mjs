// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
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

  // Disable react-in-jsx-scope for React 17+
  jsxRuntime,

  // Custom rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
        "@typescript-eslint/no-explicit-any": "off", // ~197 "any" usages
        "@typescript-eslint/no-unused-vars": "off", // ~162 unused vars (ex: catch)
        
        "@typescript-eslint/no-empty-object-type": "off", // 13 errors, this can be an easy win 
        "react/display-name": "off", // 42 errors becauase of anonymous FC names. Can be an easy win

        "react/prop-types": "off", // 497 errors, this seems like false positives? Need to investigate more
        
        "react/no-unescaped-entities": "off",

        "no-empty-pattern": "off",
        "eqeqeq": "off",
        "no-mixed-operators": "off",
        "no-throw-literal": "off",
        "no-case-declarations": "off",
        
        "jsx-a11y/alt-text": "off",
    },
  },

  // Prettier config (must be last)
  prettierConfig
);
