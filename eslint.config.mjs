// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
	// Global ignores
	{
		ignores: ['**/build/', '.yarn/', '.pnp.loader.mjs', '.pnp.cjs'],
	},

	// Base ESLint recommended rules
	eslint.configs.recommended,

	// TypeScript rules
	...tseslint.configs.recommended,

	// React rules
	{
		...reactRecommended,
		files: ['**/*.{js,jsx,ts,tsx}'],
		settings: {
			react: {
				version: 'detect',
			},
		},
	},

	// Disable react-in-jsx-scope for React 17+
	jsxRuntime,

	// Custom rules
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'unused-imports': unusedImports,
		},
		rules: {
			'react/prop-types': 'off', // RECOMMENDED: for React with Typescript: Turn off prop-types rule as TypeScript is used instead
			'unused-imports/no-unused-imports': 'error', // RECOMMENDED: Throw errors on any unused imports
		},
	},

	// Prettier config (must be last)
	prettierConfig
);
