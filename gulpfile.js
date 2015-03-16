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
if (elixir.config.production) {
    minSuffix='.min';
}


elixir(function(mix) {

        /**
         * Combining scripts and their dependencies
         */
        mix.scripts(
            [
                'bower_components/jquery-validation/dist/jquery.validate.js',
                'bower_components/phpjs/functions/strings/strlen.js',
                'bower_components/phpjs/functions/datetime/strtotime.js',
                'bower_components/php-date-formatter/js/php-date-formatter.js',
                'assets/js/jsvalidation.js',
                'assets/js/helpers.js',
                'assets/js/timezones.js',
                'assets/js/validations.js'
            ],
            'public/js/jsvalidation'+minSuffix+'.js',
            'resources'
        );

        //mix.copy('public/js/jsvalidation'+minSuffix+'.js','../../../public/vendor/jsvalidation/js/jsvalidation'+minSuffix+'.js');

});
