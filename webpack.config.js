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
				test: /\.jsx?$/,
				include: [path.join(__dirname, 'scripts')],
				// loader: 'babel-loader',
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
			{
				// test: ,
				include: [path.join(__dirname, 'node_modules', 'pixi.js')],
				enforce: 'post',
				// loader: 'ify-loader',
				use: [
					{loader: 'ify-loader'},
				],
			},
			{
				test: /\.json$/,
				include: [path.join(__dirname, 'scripts')],
				use: [
					{loader: 'json-loader'},
				],
			},
		],
	}
};
