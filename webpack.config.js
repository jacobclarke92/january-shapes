var path = require('path');
var webpack = require('webpack');

var babelLoaderSettings = JSON.stringify({
	cacheDirectory: true,
	presets: ['es2015', 'stage-0', 'react'],
	plugins: ['transform-decorators-legacy', 'glslify'],
});

module.exports = {
	devtool: '#sourcemap',
	entry: {
		scripts: [
			'./scripts/index.js'
		],
	},
	output: {
		path: path.join(__dirname, 'webroot', 'dist'),
		filename: '[name].js',
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
	],
	module: {
		rules: [
			{
				include: [path.join(__dirname, 'node_modules', 'pixi.js')],
				use: [
					{loader: 'ify-loader'},
				],
			},
			{
				test: /\.jsx?$/,
				include: [path.join(__dirname, 'scripts')],
				use: [
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
							presets: ['es2015'],
							plugins: [],
						},
					},
				],
			},
		],
	}
};
