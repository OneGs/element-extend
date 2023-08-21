module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier', 'plugin:prettier/recommended'],
	overrides: [
		{
			env: {
				node: true
			},
			files: ['.eslintrc.{js,cjs}', 'vue.config.js', 'babel.config.js'],
			parserOptions: {
				sourceType: 'script'
			}
		}
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	plugins: ['vue'],
	rules: {}
};
