let mix = require('laravel-mix');

if (! mix.inProduction()) {
    mix.js(['resources/assets/js/helpers.js'], 'public/js/helpers.js');
}

mix.combine(
    [
        'node_modules/jquery-validation/dist/jquery.validate.js',
        'node_modules/php-date-formatter/js/php-date-formatter.js',
        'resources/assets/js/jsvalidation.js',
        'public/js/helpers.js',
        'resources/assets/js/timezones.js',
        'resources/assets/js/validations.js'
    ],
    'public/js/jsvalidation' + (mix.inProduction() ? '.min' : '') + '.js'
);
