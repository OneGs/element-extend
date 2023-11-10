const { defineConfig } = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const babel = require('@rollup/plugin-babel');
const alias = require('@rollup/plugin-alias');
const vue = require('rollup-plugin-vue');
const path = require('path');
const replace = require('@rollup/plugin-replace');
const commonJs = require('@rollup/plugin-commonjs');

/**
 * Rollup Configuration, 建议使用 defineConfig 以支持TS识别
 */
module.exports = defineConfig([
	{
		input: 'index.js',
		output: [
			{
				// import 'xxx'
				dir: 'dist',
				format: 'es',
				entryFileNames: () => `[name].mjs`
			}
		],
		plugins: [
			replace({
				'process.env.NODE_ENV': JSON.stringify('production')
			}),
			nodeResolve(),
			alias({
				entries: [
					{
						find: '@',
						replacement: path.resolve(__dirname, './src')
					}
				]
			}),
			vue(),
			postcss(),
			babel({
				babelHelpers: 'bundled', // 如果 vue 存在 jsx 语法，
				extensions: ['.js', '.vue'] // 则会从 babel.config.js, 调用 @vue/babel-preset-jsx 处理
			}),
			commonJs()
		],

		// 排除不需要混入代码中的第三方依赖
		external: [
			/^vue(\/.+|$)/ // 也可以字符串 'vue'
		]
	}
]);
