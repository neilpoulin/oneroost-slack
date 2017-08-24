import gulp from 'gulp'
import plumber from 'gulp-plumber'
import gutil from 'gulp-util'
import babel from 'gulp-babel'
import del from 'del'
import sourcemaps from 'gulp-sourcemaps'


// var nodemon = require('gulp-nodemon')
// var webpack = require('webpack')

const paths = {
    outputRoot: 'dist',
    sourceRoost: 'src'
}

var devEnvProps = {
    AWS_PROFILE: 'oneroost',
    GA_TRACKING_CODE: 'UA-87950724-3',
    STRIPE_PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY_TEST,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_TEST,
    NODE_ENV: 'development'
}

var prodEnvProps = {
    AWS_PROFILE: 'oneroost',
    GA_TRACKING_CODE: 'UA-87950724-3',
    STRIPE_PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY_TEST,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY_TEST,
    NODE_ENV: 'production'
}


gulp.task('node:clean', () => {
    return del(['dist']);
})

gulp.task('node:copy-view', ['node:clean'], () => {
    gulp.src('src/view/**').pipe(gulp.dest(paths.outputRoot + '/view'))
})

gulp.task('node:transpile', ['node:clean'], () => {
    transpileNode()
})

gulp.task('node:build', ['node:transpile', 'node:copy-view', 'node:clean'])

gulp.task('node:start', ['node:build'], () => {
    startServer(devEnvProps)
})

function transpileNode(){
    gulp.src('src/javascript/**')
    .pipe(plumber({
        handleErrors: function(error){
            console.error(error);
            this.emit('end');
        }
    }))
    .pipe(babel())
    .on('error', function (err) {
        gutil.log(gutil.colors.red('[Task "transpile:node"][Babel Error]'));
        gutil.log(gutil.colors.red(err.message));
    })
    .pipe(sourcemaps.write('.', { sourceRoot: 'src/javascript' }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(paths.outputRoot + '/javascript'));
}


function startServer(props){
    gutil.log('starting the server');
    nodemon({
        exec: 'node --inspect',
        script: 'index.js',
        watch: ['dist'],
        ext: 'js html ejs json',
        delay: '200',
        env: props || devEnvProps
    }).on('restart', function () {
        console.log('nodemon restarted the node server!')
    })
}
