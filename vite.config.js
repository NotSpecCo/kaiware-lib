/// <reference types="vitest" />
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [],
	// build: {
	// 	lib: {
	// 		entry: 'src/index.ts',
	// 		name: 'kaiware-lib',
	// 		fileName: 'index'
	// 	},
	// 	outDir: 'build',
	// 	sourcemap: true
	// },
	test: {
		watch: false,
		coverage: {
			include: ['src/**/*.ts']
		}
	}
});
