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
