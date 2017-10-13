import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';
import zip from 'gulp-zip';
import jeditor from 'gulp-json-editor';
import manifestKeys from './manifestEnv.json'

const plugins = loadPlugins();

import contentWebpackConfig from './content/webpack.config';
import backgroundWebpackConfig from './background/webpack.config';

function chromeWebpack(config, cb){
    webpack(config, (err, stats) => {
        if(err) {
            plugins.util.log('[webpack: ERROR]', plugins.util.colors.red(err));
            throw new plugins.util.PluginError('webpack', err);
        }

        plugins.util.log('[webpack]', plugins.util.colors.yellow(stats.toString()));

        cb();
    });
}

gulp.task('chrome:background-js', ['chrome:clean'], (cb) => {
    return chromeWebpack(backgroundWebpackConfig, cb)
});

gulp.task('chrome:content-js', ['chrome:clean'], (cb) => {
    return chromeWebpack(contentWebpackConfig, cb)
});

gulp.task('chrome:background-html', ['chrome:clean'], () => {
    return gulp.src('background/src/background.html')
        .pipe(plugins.rename('background.html'))
        .pipe(gulp.dest('./build'))
});

gulp.task('chrome:popup-html', ['chrome:clean'], () => {
    return gulp.src('content/src/popup.html')
        .pipe(plugins.rename('popup.html'))
        .pipe(gulp.dest('./build'))
});

gulp.task('chrome:copy-manifest', ['chrome:clean'], () => {
    return gulp.src('manifest.json')
        .pipe(jeditor(manifest => {
            manifest.name = 'OneRoost' + (process.env.ENV_NAME || '')
            let envName = process.env.ENV_NAME || 'prod'
            envName = envName.toLowerCase()
            let vars = manifestKeys[envName]
            manifest.key = vars.key
            manifest.oauth2.client_id = vars.client_id
            return manifest;
        }))
        .pipe(gulp.dest('build'));

});

gulp.task('chrome:copy-oauth-html', ['chrome:clean'], () => {
    return gulp.src('chrome_ex_oauth.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('chrome:copy-images', ['chrome:clean'], () => {
    return gulp.src('images/**/*').pipe(gulp.dest('./build/images'));
})

gulp.task('chrome:copy-lib', ['chrome:clean'], () => {
    return gulp.src('lib/**/*').pipe(gulp.dest('./build/lib'));
})

gulp.task('chrome:clean', (cb) => {
    rimraf('./build', cb);
});

gulp.task('chrome:package:clean', (cb) => {
    rimraf('./dist', cb);
});

gulp.task('package:copy-manifest', ['chrome:copy-manifest'], () => {
    return gulp.src('manifest.json')
        .pipe(jeditor(manifest => {
            delete manifest.key
            return manifest
        }))
        .pipe(gulp.dest('build'));
})

gulp.task('package', ['chrome',
    'chrome:package:clean',
    'package:copy-manifest'
], () =>
    gulp.src('build/**/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'))
);

gulp.task('chrome', ['chrome:copy-images',
    'chrome:copy-lib',
    'chrome:copy-oauth-html',
    'chrome:copy-manifest',
    'chrome:popup-html',
    'chrome:background-html',
    'chrome:content-js',
    'chrome:background-js']);

gulp.task('chrome:watch', ['chrome'], () => {
    gulp.watch('content/**/*', ['chrome']);
    gulp.watch('background/**/*', ['chrome']);
    gulp.watch('manifest.json', ['chrome']);
    gulp.watch('lib/**/*', ['chrome']);
    gulp.watch('../lib/**/*', ['chrome']);
});
