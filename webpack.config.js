// Import the original config from the @wordpress/scripts package.
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// Add any a new entry point by extending the webpack config.
module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'priority-plus-navigation': './src/priority-plus-navigation.js',
		'priority-plus-nav-editor': './src/priority-plus-nav-editor.js',
	},
	output: {
		...defaultConfig.output,
	},
};
