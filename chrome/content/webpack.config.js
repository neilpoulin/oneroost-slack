const webpack = require('webpack')
const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const extractCss = new ExtractTextPlugin({
    filename: '[name].css', allChunks: false
})

module.exports = {
    entry: {
        content: [
            path.join(__dirname, 'src', 'scripts', 'content_index.js'),
            // path.join(__dirname, '..', '..', 'lib', 'styles', 'global.scss'),
            path.join(__dirname, 'src', 'styles', 'content.scss'),
        ],
        popup: [
            path.join(__dirname, 'src', 'scripts', 'popup_index.js'),
            // path.join(__dirname, '..', '..', 'lib', 'styles', 'global.scss'),
            path.join(__dirname, 'src', 'styles', 'content.scss'),
        ],
    },

    output: {
        filename: '[name].js',
        path: path.join(__dirname, '../', 'build'),
        publicPath: '/'
    },

    resolve: {
        extensions: ['.js', '.jsx', '.scss', '.json', 'css'],
        modules: [
            'scripts',
            'store',
            'ducks',
            '../proxy/src/scripts',
            'components',
            'components/app',
            'components/view',
            'selectors',
            'atoms',
            'node_modules',
            'actions',
            'controllers',
            '../../lib'
        ]
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /^(?!.*\.test\.jsx?$).*\.jsx?$/,
                exclude: /(node_modules)/,
                include: [
                    path.join(__dirname, 'src', 'scripts'),
                    path.join(__dirname, '..', '..', 'lib', 'scripts')
                ],
                use: [
                    {loader: 'babel-loader'},
                    {loader: path.join(__dirname, '..', '..', 'loaders', 'jsx-import-sass-loader')}
                ]

            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader?name=fonts/[name].[ext]'
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                // test: path.join(__dirname, 'src', 'scripts', 'global.scss'),
                test: [
                    // path.join(__dirname, '..', '..', 'lib', 'styles', 'global.scss'),
                    path.join(__dirname, 'src', 'styles', 'content.scss')
                ],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: true, }
                        },
                        {
                            loader: 'sass-loader',
                            options: {sourceMap: true, }
                        }
                    ]
                })
            },
            {
                test: /\.scss$/,
                // exclude: path.join(__dirname, 'src', 'scripts', 'global.scss'),
                exclude: [
                    // path.join(__dirname, '..', '..', 'lib', 'styles', 'global.scss'),
                    path.join(__dirname, 'src', 'styles', 'content.scss')
                ],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: false}
                        },
                        {
                            loader: 'css-encapsulation-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {sourceMap: false, }
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        extractCss,
        new ProgressBarPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify('production')}}),
        new OptimizeCssAssetsPlugin()
    ],
    context: __dirname,
};
