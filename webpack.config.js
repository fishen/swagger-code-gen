const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { plugin: BundleDTSPlugin } = require('bundle-dts');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    externals: [nodeExternals()],
    devtool: "source-map",
    module: {
        rules: [{ test: /\.ts(x?)$/, loader: "ts-loader" }]
    },
    plugins: [
        new CopyPlugin([{ from: './src/templates', to: './templates' }]),
        new BundleDTSPlugin()
    ],
    resolve: {
        extensions: ['.ts']
    },
    optimization: {
        minimize: false
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname),
        libraryTarget: 'commonjs'
    }
};