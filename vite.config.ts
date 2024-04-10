import babel from '@rollup/plugin-babel';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'kaiware-lib',
			fileName: 'index'
		},
		outDir: 'build',
		sourcemap: true,
		rollupOptions: {
			plugins: [
				babel({
					extensions: ['.js', '.ts', '.mjs', '.cjs', '.html'],
					babelHelpers: 'runtime',
					exclude: ['node_modules/@babel/**'],
					presets: [
						[
							'@babel/preset-env',
							{
								targets: { firefox: '48' },
								exclude: ['@babel/plugin-transform-regenerator']
							}
						]
					],
					plugins: [
						'@babel/plugin-syntax-dynamic-import',
						[
							'@babel/plugin-transform-runtime',
							{
								useESModules: true,
								regenerator: false
							}
						]
					]
				})
			]
		}
	},
	plugins: [dts()],
	resolve: {
		alias: {
			$: resolve(__dirname, 'src')
		}
	}
});
