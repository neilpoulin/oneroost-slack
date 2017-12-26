import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import rimraf from 'rimraf';
import zip from 'gulp-zip';
import jeditor from 'gulp-json-editor';
import notify from 'gulp-notify'
import manifestKeys from './manifestEnv.json'
import path from 'path'
import opn from 'opn'

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
            let envName = process.env.ENV_NAME || 'stage'
            envName = envName.toLowerCase()
            manifest.name = `OneRoost${(envName === 'prod' ? '' : ' ' + process.env.ENV_NAME)}`
            if (envName !== 'prod'){
                manifest.permissions.push(`https://${envName}.oneroost.com/*`)
                manifest.icons['128'] = 'images/oneroost_logo_square_128x128_alt.png'
                manifest.browser_action.default_icon['30'] = 'images/logo30x30_alt.png'
            } else {
                manifest.permissions.push('https://www.oneroost.com/*')
            }
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
    return gulp.src('build/manifest.json')
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

gulp.task('manifest:tick', () => {
    return gulp.src('manifest.json')
        .pipe(jeditor(manifest => {
            let version = manifest.version;
            console.log('current version', version)
            let [major, minor] = version.split('.')
            manifest.version = `${Number(major)}.${Number(minor) + 1}`
            console.log('new version', manifest.version)
            return manifest
        }))
        .pipe(gulp.dest('./'));
})

notify.on('click', function (options) {
    console.log('I clicked something!', options);
    // opn(null, {app: 'google chrome', wait: false})
    //     .then((resp) => console.log('succssfully opened browser', resp))
    //     .catch(console.error);
});

let notifyOpts = {
    title: '\u2705 OneRoost',
    message:'Finished Building OneRoost Chrome Extension.',
    // message: 'Click to go to the extensions page',
    onLast: true,
    icon: path.join(__dirname, 'images', 'oneroost_logo_square_128x128.png'),
    // open: 'https://inbox.google.com',
    wait: true,
    timeout: 5
}

gulp.task('notify-test', () => {
    gulp.src('gulpfile.babel.js')
        .pipe(notify(notifyOpts))
})

gulp.task('notify', ['chrome'], () => {
    gulp.src('gulpfile.babel.js')
        .pipe(notify(notifyOpts))
})

gulp.task('chrome', ['chrome:copy-images',
    'chrome:copy-lib',
    'chrome:copy-oauth-html',
    'chrome:copy-manifest',
    'chrome:popup-html',
    'chrome:background-html',
    'chrome:content-js',
    'chrome:background-js']);

gulp.task('chrome:watch', ['chrome', 'notify'], () => {
    gulp.watch('content/**/*', ['chrome', 'notify']);
    gulp.watch('background/**/*', ['chrome', 'notify']);
    gulp.watch('manifest.json', ['chrome', 'notify']);
    gulp.watch('lib/**/*', ['chrome', 'notify']);
    gulp.watch('../lib/**/*', ['chrome', 'notify']);
});
