// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';

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

	// React Hooks rules.
	//
	// `exhaustive-deps` is the one that matters most here: this dashboard polls chain state and
	// subscribes to wallet events, so an effect that captures a stale `address` or `ecosystem`
	// silently renders data for the wrong account. Nothing was checking for that before.
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},

	// Custom rules
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'unused-imports': unusedImports,
		},
		rules: {
			'react/prop-types': 'off', // RECOMMENDED: for React with Typescript: Turn off prop-types rule as TypeScript is used instead
			'unused-imports/no-unused-imports': 'error', // RECOMMENDED: Throw errors on any unused imports

			// Require strict equality.
			//
			// This is not just style here: big.js values are objects, so `someBig == new Big(0)`
			// compares references and is ALWAYS false. Two such guards existed in mathHelpers.ts
			// and silently never fired — one of them let a division by zero through. `smart` still
			// permits the `== null` idiom for null/undefined checks.
			eqeqeq: ['error', 'smart'],
		},
	},

	// Prettier config (must be last)
	prettierConfig
);
