## Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Code Coverage](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/?branch=master)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/proengsoft/laravel-jsvalidation)

[JQuery Validation Plugin]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.3/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.3/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.3/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.3/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.3/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.3/localization
[Validation]: http://laravel.com/docs/5.3/validation
[Custom Validation Rules]: http://laravel.com/docs/5.3/validation#custom-validation-rules
[JQueryValidation]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.3/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.3/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.3/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.3/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.3/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.3/localization 
[Validation]: http://laravel.com/docs/5.3/validation 
[Validation Rules]: http://laravel.com/docs/5.3/validation#available-validation-rules
[Custom Validation Rules]: http://laravel.com/docs/5.3/validation#custom-validation-rules
**Laravel Javascript Validation** package allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms automatically in client side without need to write any Javascript code or use HTML Builder Class. 

You can validate forms automatically referencing it to your defined validations. The messages are loaded from your  validations and translated according your Localization preferences.
  

#### Feature overview

- Automatic creation of Javascript validation based on your [Validation Rules][] or [FormRequest][], no Javascript coding required.
- Supports other validation packages. 
- AJAX validation for [ActiveURL](http://laravel.com/docs/5.3/validation#rule-active-url), [Unique](http://laravel.com/docs/5.3/validation#rule-unique) and [Exists](http://laravel.com/docs/5.3/validation#rule-exists) Rules, [Custom Validation Rules][] and other validation packages
- Unobtrusive integration, you can use without Laravel Form Builder
- The package uses [Jquery Validation Plugin](http://jqueryvalidation.org/)  bundled in provided script.
- Uses Laravel Localization to translate messages.


#### Supported Rules

**Almost all [Validation Rules][] provided by Laravel and other packages are supported**.

Almost are validated in client-side using Javascript, but in some cases, the validation should to be done in server-side via AJAX:
 - [ActiveURL](http://laravel.com/docs/5.3/validation#rule-active-url)
 - [Unique](http://laravel.com/docs/5.3/validation#rule-unique)
 - [Exists](http://laravel.com/docs/5.3/validation#rule-exists)
 - [Custom Validation Rules](https://laravel.com/docs/5.3/validation#custom-validation-rules)
 - Validations provided by other packages


##### Unsupported Rules

Some Laravel validations are not implemented yet.
    
- [Present](https://laravel.com/docs/5.3/validation#rule-present) 
- [DateFormat](https://laravel.com/docs/5.3/validation#rule-date-format) rule don't support timezone format


#### Getting started
The easiest way to create Javascript validations is using [Laravel Form Request Validation](http://laravel.com/docs/5.3/validation#form-request-validation).

##### Installation
Follow the [Installation Guide](https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation) to install the package. **The default config shlould work out-of-box**

##### Validating Form Request
Call [JsValidator](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade) Facade in your view to validate any [FormRequest](https://laravel.com/docs/master/validation)
 
```html
 <form>
    <!-- ... My form stuff ... -->
 <form>

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


#### License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

