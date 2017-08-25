var path = require('path');
var webpack = require('webpack');
var ProgressBarPlugin = require("progress-bar-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
var extractCssPlugin = new ExtractTextPlugin({
    filename: "styles.css",
    allChunks: true,
});



module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'webpack-hot-middleware/client',
        './frontend/src/index.js',
        './frontend/src/global.scss'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.css', '.scss'],
        modules: ['frontend', 'src', 'ducks', 'components', 'node_modules']
    },
    plugins: [
        new ProgressBarPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ProgressBarPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {loader: 'react-hot-loader'},
                    {loader:'babel-loader'},
                    {loader: path.join(__dirname, 'loaders', 'jsx-import-sass-loader')}
                ],
                include: path.join(__dirname, 'frontend', 'src')
            },
            {
                test: path.join(__dirname, 'frontend', 'src', 'global.scss'),
                use: [
                    {
                        loader:  "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {sourceMap: true, }
                    },                    
                    {
                        loader: "sass-loader",
                        options: {sourceMap: true, }
                    }
                ]
            },
            {
                test: /\.scss$/,
                exclude: path.join(__dirname, 'frontend', 'src', 'global.scss'),
                use: [
                    {
                        loader:  "style-loader",
                    },
                    {
                        loader: "css-loader",
                        options: {sourceMap: true, }
                    },
                    {
                        loader: "css-encapsulation-loader"
                    },
                    {
                        loader: "sass-loader",
                        options: {sourceMap: true, }
                    }
                ]
            }
        ]
    }
};
