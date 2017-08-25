import path from 'path'
import express from 'express'
import {
    isProd,
} from './../Environment'

module.exports = function(app){
    if (isProd()){
        console.log('****PRODUCTION*****')
        let bundlePath = path.join(process.cwd(), './dist')
        app.use('/static', express.static(bundlePath));
    } else {
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
    }
    app.use("/static/images", express.static(__dirname + "./../../../../images"));
}
