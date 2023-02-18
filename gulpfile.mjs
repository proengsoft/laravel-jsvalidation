import gulp from 'gulp';
import {deleteAsync} from 'del';
import gp_sourcemaps from 'gulp-sourcemaps';
import gp_concat from 'gulp-concat';
import gp_rename from 'gulp-rename';
import gp_filter from 'gulp-filter';
import gp_uglify from 'gulp-uglify';
import webpack from 'webpack-stream';

const esBuildDir = 'es-build/';
gulp.task('build', gulp.series(
    function () {
        return gulp.src(['resources/assets/js/helpers.js'])
            .pipe(webpack({
                target: ['web', 'es5'],
                devtool: 'inline-source-map',
                mode: 'development',
                output: {
                    filename: 'helpers.js'
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    "plugins": [
                                        ['@babel/plugin-transform-runtime', {debug: true}]
                                    ]
                                }
                            }
                        }
                    ]
                }
            }))
            .pipe(gulp.dest(esBuildDir));
    },
    function () {
        return gulp.src([
            'node_modules/jquery-validation/dist/jquery.validate.js',
            'node_modules/php-date-formatter/js/php-date-formatter.js',
            'resources/assets/js/jsvalidation.js',
            esBuildDir + '/helpers.js',
            'resources/assets/js/timezones.js',
            'resources/assets/js/validations.js'
        ], {base: '.'})
            .pipe(gp_sourcemaps.init())
            .pipe(gp_concat('jsvalidation.js'))
            .pipe(gp_sourcemaps.write('./'))
            .pipe(gulp.dest('public/js'))
            // gp_sourcemaps will cause two files to be in the stream (common.js and common.js.map) which means
            // gp_uglify will try to run on the .map file as well, resulting in an error. gulp-filter only
            // passes .js files from this point (https://stackoverflow.com/a/39675819)
            .pipe(gp_filter('**/*.js'))
            .pipe(gp_rename({ extname: '.min.js' }))
            .pipe(gp_uglify())
            .pipe(gp_sourcemaps.write('./'))
            .pipe(gulp.dest('public/js'));
    },
    function () {
        return deleteAsync(esBuildDir);
    }
));