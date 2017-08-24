var path = require('path');
var express = require('express');

module.exports = function(app){
    var isProd = process.env.NODE_ENV === 'production';
    if (!isProd){
        console.log('****DEVELOPMENT*****')
        var config = require(path.join(process.cwd(), 'webpack.config.dev.babel'));
        var compiler = require('webpack')(config);

        app.use(require('webpack-dev-middleware')(compiler, {
            publicPath: config.output.publicPath,
            stats: {colors: true},
            noInfo: true,
        }));

        app.use(require('webpack-hot-middleware')(compiler, {
            log: console.log,
        }));
    } else {
        console.log('****PRODUCTION*****')
        let bundlePath = path.join(process.cwd(), './dist')
        app.use('/static', express.static(bundlePath));
    }

}
