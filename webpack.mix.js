let mix = require('laravel-mix');

mix.combine(
    [
        'node_modules/jquery-validation/dist/jquery.validate.js',
        'node_modules/phpjs/functions/strings/strlen.js',
        'node_modules/phpjs/functions/array/array_diff.js',
        'node_modules/phpjs/functions/datetime/strtotime.js',
        'node_modules/phpjs/functions/var/is_numeric.js',
        'node_modules/php-date-formatter/js/php-date-formatter.js',
        'resources/assets/js/jsvalidation.js',
        'resources/assets/js/helpers.js',
        'resources/assets/js/timezones.js',
        'resources/assets/js/validations.js'
    ],
    'public/js/jsvalidation' + (mix.inProduction() ? '.min' : '') + '.js'
);
