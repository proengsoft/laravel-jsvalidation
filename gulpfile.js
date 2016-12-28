var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */


var minSuffix='';
var bowerPath='../bower_components/';
if (elixir.config.production) {
    minSuffix='.min';
}


elixir(function(mix) {

        /**
         * Combining scripts and their dependencies
         */
        mix.scripts(
            [
                    bowerPath + 'jquery-validation/dist/jquery.validate.js',
                    bowerPath + 'phpjs/src/php/strings/strlen.js',
                    bowerPath + 'phpjs/src/php/array/array_diff.js',
                    bowerPath + 'phpjs/src/php/datetime/strtotime.js',
                    bowerPath + 'phpjs/src/php/var/is_numeric.js',
                    bowerPath + 'php-date-formatter/js/php-date-formatter.js',
                    'assets/js/jsvalidation.js',
                    'assets/js/helpers.js',
                    'assets/js/timezones.js',
                    'assets/js/validations.js'
            ],
            'public/js/jsvalidation' + minSuffix + '.js',
            'resources'
        );

        mix.copy('public/js/jsvalidation'+minSuffix+'.js','../../../public/vendor/jsvalidation/js/jsvalidation'+minSuffix+'.js');

});
