var path = require('path');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var extractCssPlugin = new ExtractTextPlugin({
    filename: 'styles.css',
    allChunks: true,
});

module.exports = {
    devtool: 'eval-source-map',
    entry: [
        './frontend/src/index.js',
        './frontend/src/frontend.scss'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.css', '.scss'],
        modules: ['frontend', 'src', 'containers', 'ducks', 'components', 'actions', 'organisms', 'molecules', 'node_modules', './lib/scripts', './lib/styles', './lib/fonts'],
        alias: {
            models: path.join(__dirname, 'lib/scripts/models/frontend/'),
            'react-select-css': path.join(__dirname, 'node_modules', 'react-select/dist/react-select.css')
        }
    },
    plugins: [
        extractCssPlugin,
        new ProgressBarPlugin(),
        new OptimizeCssAssetsPlugin()
    ],
    module: {
        rules: [
            {
                test: /^(?!.*\.test\.jsx?$).*\.jsx?$/,
                use: [
                    {loader:'babel-loader'},
                    {loader: path.join(__dirname, 'loaders', 'jsx-import-sass-loader')}
                ],
                include: [
                    path.join(__dirname, 'frontend', 'src'),
                    path.join(__dirname, 'lib', 'scripts')
                ]
            },
            {
                test: path.join(__dirname, 'frontend', 'src', 'frontend.scss'),
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: true, }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                // includePaths: path.join(__dirname, 'frontend', 'src', 'index.scss')
                            }
                        }
                    ]
                })
            },
            {
                test: /\.scss$/,
                exclude: path.join(__dirname, 'frontend', 'src', 'frontend.scss'),
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: true, }
                        },
                        {
                            loader: 'css-encapsulation-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                })
            },
            {
                test: /\.css$/,
                exclude: path.join(__dirname, 'frontend', 'src', 'frontend.scss'),
                use: [
                    {
                        loader:  'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {sourceMap: true, }
                    },
                ]
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            },
        ]
    },
};
