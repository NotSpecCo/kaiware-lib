import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'node:path';

/** @type {import('rollup').RollupOptions[]} */
export default [
	{
		input: [
			'src/index.ts',
			'src/enums/index.ts',
			'src/lib/index.ts',
			'src/types/index.ts',
			'src/utils/index.ts'
		],
		output: {
			dir: 'build/esm',
			format: 'esm',
			preserveModules: true,
			exports: 'named'
		},
		preserveEntrySignatures: 'strict',
		plugins: [
			typescript({
				outDir: 'build/esm/src'
			}),
			alias({
				customResolver: nodeResolve({ extensions: ['.ts', '.js', '.d.ts'] }),
				entries: [{ find: 'src', replacement: path.resolve(__dirname, 'build/esm/src') }]
			}),
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
			}),
			nodeResolve()
		]
	},
	{
		input: [
			'src/index.ts',
			'src/enums/index.ts',
			'src/lib/index.ts',
			'src/types/index.ts',
			'src/utils/index.ts'
		],
		output: {
			dir: 'build/cjs',
			format: 'cjs',
			preserveModules: true,
			exports: 'named'
		},
		preserveEntrySignatures: 'strict',
		plugins: [
			alias({
				entries: [{ find: '$', replacement: path.resolve(__dirname, 'src') }]
			}),
			typescript({
				outDir: 'build/cjs/src'
			}),
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
			}),
			nodeResolve()
		]
	}
];
