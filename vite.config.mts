import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(), // This plugin automatically handles Emotion's Babel transform if @emotion/react or @emotion/styled is detected.

	],
	// To match homepage: "." from package.json for relative asset paths in the build.
	base: './',
	build: {
		// Output directory, CRA defaults to 'build'.
		outDir: 'build',
		// To match the previous `react-scripts build --nomaps` behavior.
		// Set to true if you want sourcemaps for production.
		sourcemap: false,

		rollupOptions: {
			output: {

				// Not used for now but something to consider:
				/*
				manualChunks(id, { getModuleInfo }) {
					// id is the absolute path to the module

					// Example of id: ".../src/configs/config.ts" where three dots are your path ex: C:/projects/datamine-client....

					// --- Rule 1: Group all files in src/configs/ into a 'config' chunk ---
					// This is useful as we frequently change configs and only want one file to be updated
					if (id.indexOf('src/configs/') > -1) {
						return 'config';
					}

					// --- Default Behavior ---
					// For all other modules that don't match your 'config' rule or other rules,
					// return null. This tells Rollup/Vite to use its default chunking logic.
					return null;
				},*/
				entryFileNames: (chunkInfo) => {
					// Example: Keep 'background.js' unhashed for a Chrome extension
					if (chunkInfo.name === 'background') {
						return '[name].js';
					}
					return 'assets/[name]-[hash].js'; // Hash other entry files
				},
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]',
			},
		},
	},
	server: {
		port: 3000, // Optional: CRA's default port.
		open: true    // Optional: Open browser on start.
	},
	// Vite handles process.env.NODE_ENV via import.meta.env.MODE
	// If you have other global constants defined via process.env in CRA,
	// you might need to use the `define` option here.
	// define: {
	//   'process.env.SOME_VARIABLE': JSON.stringify('some_value')
	// }
})
