import gulp from 'gulp'
import gutil from 'gulp-util'
import del from 'del'
import webpack from 'webpack'
import webpackConfig from './webpack.config.babel.js'
import nodemon from 'gulp-nodemon'
import plumber from 'gulp-plumber'
import babel from 'gulp-babel'
import sourcemaps from 'gulp-sourcemaps'

const nodeBabelOptions = {
    presets: ['es2015', 'stage-0'],
    plugins: [
        'transform-async-to-generator',
        ['module-resolver', {
            'root': ['./node/src/javascript'],
            'alias': {
                'models': './node/dist/lib/models/server',
                'util': './node/dist/lib/util',
            }
        }]
    ]
}

const nodeLibBabelOptions = {
    presets: ['es2015', 'stage-0'],
    plugins: [
        'transform-async-to-generator',
    ]
}

gulp.task('clean', ['fe:clean', 'node:clean'])

gulp.task('fe:clean', () => {
    return del('dist')
})

gulp.task('fe:webpack:watch', ['fe:webpack'], (done) => {
    gulp.watch('frontend/src/**', ['fe:webpack'])
    gulp.watch('lib/**', ['fe:webpack'])
})

gulp.task('fe:webpack', ['fe:clean'], (done) => {
    return bundle(done)
})

gulp.task('dev', ['fe:clean', 'node:start:dev'])
gulp.task('server', ['fe:clean', 'fe:webpack:watch', 'node:start:prod'])
gulp.task('install', ['fe:clean', 'fe:webpack', 'node:build'])
const nodePaths = {
    outputRoot: 'node/dist',
    sourceRoot: 'node/src',
    root: 'node',
    models: 'lib/scripts/models',
    util: 'lib/scripts/util',
    lib: 'lib/scripts'
}

const sharedProps = {
    AWS_PROFILE: 'oneroost',
    STRIPE_PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY_TEST,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_TEST,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_ENDPOINT_SECRET_TEST,
    PARSE_MASTER_KEY: process.env.ONEROOST_PARSE_MASTER_KEY_DEV,
    PARSE_APP_ID: process.env.ONEROOST_PARSE_APP_ID_DEV,
    DATABASE_URL: 'mongodb://localhost:27017/oneroost-slack',
    DOCUMENT_BUCKET: 'oneroost-documents',
    GA_TRACKING_CODE: 'UA-87950724-3',
    INTERCOM_APP_ID: process.env.INTERCOM_APP_ID_DEV,
    // VERBOSE: 1, //used for parse server verbose mode
}

var devEnvProps = {
    ...sharedProps,
    NODE_ENV: 'development',
    ENV: 'dev',
    ENV_NAME: 'dev',
}

var prodEnvProps = {
    ...sharedProps,
    NODE_ENV: 'production',
    ENV: 'prod',
    ENV_NAME: 'prod-dev',
    // JSON_LOGS: '1'
}

gulp.task('node:clean', () => {
    return del([nodePaths.outputRoot]);
})

gulp.task('node:copy-view', ['node:clean'], () => {
    return gulp.src(nodePaths.sourceRoot + '/view/**').pipe(gulp.dest(nodePaths.outputRoot + '/view'))
})

gulp.task('node:transpile', ['node:clean'], () => {
    return transpileNode()
})

gulp.task('node:build', ['node:transpile', 'node:copy-view', 'node:clean'], (done) => {
    return done()
})

gulp.task('node:start:dev', ['node:build'], () => {
    startServer(devEnvProps)
    // gulp.watch(nodePaths.sourceRoot, ['node:build'])
})

gulp.task('node:start:prod', ['node:build'], (done) => {
    // gulp.watch(nodePaths.sourceRoot, ['node:build', 'node:clean'])
    return startServer(prodEnvProps)
})

function transpileNodeLib(){
    console.log('transpile node lib')
    return gulp.src([nodePaths.lib + '/**/*.js', '!**/*.test.js'])
        .pipe(plumber({
            handleErrors: function(error){
                console.error(error);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(babel(nodeLibBabelOptions))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Task "transpile:node"][Babel Error]'));
            gutil.log(gutil.colors.red(err.message));
        })
        .pipe(sourcemaps.write('.', { sourceRoot: nodePaths.lib }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(nodePaths.outputRoot + '/lib'));

}

function transpileNode(){
    transpileNodeLib()
    console.log('transpile src = ' + nodePaths.sourceRoot + '/javascript/**')
    return gulp.src([nodePaths.sourceRoot + '/javascript/**', '!**/*.test.js'])
        .pipe(plumber({
            handleErrors: function(error){
                console.error(error);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(babel(nodeBabelOptions))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Task "transpile:node"][Babel Error]'));
            gutil.log(gutil.colors.red(err.message));
        })
        .pipe(sourcemaps.write('.', { sourceRoot: nodePaths.sourceRoot + '/javascript' }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(nodePaths.outputRoot + '/javascript'));
}


function startServer(props){
    gutil.log('starting the server');
    return nodemon({
        exec: 'node --inspect',
        script: 'main.js',
        watch: [nodePaths.sourceRoot],
        tasks: ['node:build'],
        ext: 'js html ejs json',
        delay: '200',
        env: props || devEnvProps
    }).on('restart', function () {
        console.log('nodemon restarted the node server!')
    })
}


function bundle(done, withLog=false, withStats=false, env='prod') {
    webpack(webpackConfig).run((err, stats) => {
        if (err) {
            var error = new gutil.PluginError('bundle', err);
            gutil.log(gutil.colors.red(error));
            throw new gutil.PluginError({
                plugin: 'bundle',
                message: 'Failed to process webpack config successfully.'
            });
        }
        else {
            if(withLog){
                gutil.log(`[webpack:build-${env}]`, stats.toString({
                    colors: true,
                    version: true,
                    timings: true,
                    errorDetails: true,
                    hash: true,
                    assets: true,
                    chunks: false
                }));
                Object.keys(stats.compilation.assets).forEach(function(key) {
                    gutil.log('Webpack: output ', gutil.colors.green(key));
                });
            }
            if (done) {
                done();
            }
        }
    })
}
