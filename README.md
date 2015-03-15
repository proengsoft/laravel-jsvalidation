# Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Coverage Status](https://img.shields.io/scrutinizer/coverage/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/code-structure)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/league/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/league/laravel-jsvalidation)

[JQueryValidation]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.0/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.0/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.0/validation#error-messages-and-views
[Moment.js]: http://momentjs.com/

## About

This package allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms via Javascript transparently. You can validate forms automatically
 referencing it to your defined validations. The messages are loaded from your validators and translated according your Localization preferences.
  
The Javascript validations are made using [JQueryValidation][] and [Moment.js], that are included in the package. 

## Feature overview

- Automatic creation of javascript validation based on your [Validation Rules][], [Messages][], [FormRequest][] and [Validators][].
- Unobtrusive integration, you can use independently of Laravel Form Builder.
- No Javascript coding required.
- Uses Laravel Localization to translate messages.
- Can be configured in controllers or views.
- Integrate with your [Custom Validations]()
  


## Install

Via Composer

``` bash
$ composer require proengsoft/laravel-jsvalidation
```

## Usage

``` php
$skeleton = new League\Skeleton();
echo $skeleton->echoPhrase('Hello, League!');
```

## Testing

``` bash
$ phpunit
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email a.moreno@proengsoft.com instead of using the issue tracker.

## Credits

- [Proengsoft](https://github.com/proengsoft)
- [Albert Moreno](https://github.com/torrentalle)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
