## Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Code Coverage](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/?branch=master)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/proengsoft/laravel-jsvalidation)

**Laravel Javascript Validation** package allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms automatically in client side without need to write any Javascript code or use HTML Builder Class. 

You can validate forms automatically referencing it to your defined validations. The messages are loaded from your  validations and translated according your Localization preferences.

#### Version matrix

| Laravel Version | Package Version |
| --------------- | --------------- |
| `5.6`           | `2.x (>2.2.0)`  |
| `5.5`           | `2.x (>2.1.0)`  |
| `5.4`           | `2.x`           |
| `5.3`           | `1.x`           |
| `5.2`          | `1.x`           |
| `5.1`           | `1.x`           |
| `5.0`           | `1.x`           |

#### Feature overview

- Automatic creation of Javascript validation based on your [Validation Rules][] or [FormRequest][], no Javascript coding required.
- Supports other validation packages. 
- AJAX validation for [ActiveURL][], [Unique][] and [Exists][] Rules, [Custom Validation Rules][] and other validation packages
- Unobtrusive integration, you can use without Laravel Form Builder
- The package uses [Jquery Validation Plugin][]  bundled in provided script.
- Uses Laravel Localization to translate messages.

#### Supported Rules

**Almost all [Validation Rules][] provided by Laravel and other packages are supported**.

Almost are validated in client-side using Javascript, but in some cases, the validation should to be done in server-side via AJAX:
 - [ActiveURL][]
 - [Unique][]
 - [Exists][]
 - [Custom Validation Rules][]
 - Validations provided by other packages

##### Unsupported Rules

Some Laravel validations are not implemented yet.
    
- [Present][] 
- [DateFormat][] rule don't support timezone format

#### Getting started

The easiest way to create Javascript validations is using [Laravel Form Request Validation][].

##### Installation

Follow the [Installation Guide][] to install the package. **The default config should work out-of-box**

##### Validating Form Request

Call [JsValidator Facade][] in your view to validate any [FormRequest](https://laravel.com/docs/master/validation)
 
```html
<form>
    <!-- ... My form stuff ... -->
</form>

<!-- Javascript Requirements -->
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min.js"></script>

<!-- Laravel Javascript Validation -->
<script type="text/javascript" src="{{ asset('vendor/jsvalidation/js/jsvalidation.js')}}"></script>

{!! JsValidator::formRequest('App\Http\Requests\MyFormRequest') !!}
```

Take a look to [Basic Usage](https://github.com/proengsoft/laravel-jsvalidation/wiki/Basic-Usage) or [Examples](https://github.com/proengsoft/laravel-jsvalidation/wiki/Validating-Examples) to get more information.

#### Documentation

**To get more info refer to [Project Wiki](https://github.com/proengsoft/laravel-jsvalidation/wiki/Home)**

#### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

#### Contributing

Please see [CONTRIBUTING][] for details.

#### Credits

[Laravel Javascript Validation contributors list](../../contributors)

#### License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

[ActiveURL]: https://laravel.com/docs/5.4/validation#rule-active-url
[CONTRIBUTING]: https://github.com/proengsoft/laravel-jsvalidation/wiki/Contributing
[Custom Validations]: https://laravel.com/docs/5.4/validation#custom-validation-rules
[Custom Validation Rules]: https://laravel.com/docs/5.4/validation#custom-validation-rules
[DateFormat]: https://laravel.com/docs/5.4/validation#rule-date-format
[Exists]: https://laravel.com/docs/5.4/validation#rule-exists
[FormRequest]: https://laravel.com/docs/5.4/validation#form-request-validation
[Installation Guide]: https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation
[JsValidator Facade]: https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade
[JQueryValidation]: https://jqueryvalidation.org/
[JQuery Validation Plugin]: https://jqueryvalidation.org/
[Laravel Form Request Validation]: http://laravel.com/docs/5.4/validation#form-request-validation
[Laravel Localization]: https://laravel.com/docs/5.4/localization
[Messages]: https://laravel.com/docs/5.4/validation#error-messages-and-views
[Present]: https://laravel.com/docs/5.4/validation#rule-present
[Unique]: https://laravel.com/docs/5.4/validation#rule-unique
[Validation]: https://laravel.com/docs/5.4/validation 
[Validation Rules]: https://laravel.com/docs/5.4/validation#available-validation-rules
[Validators]: https://laravel.com/docs/5.4/validation#form-request-validation
