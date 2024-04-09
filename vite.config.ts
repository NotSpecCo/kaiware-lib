import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: './src/index.ts',
			name: 'kaiware-lib',
			fileName: 'index'
		},
		outDir: 'build'
	}
});
