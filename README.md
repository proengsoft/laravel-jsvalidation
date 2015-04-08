# Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Code Coverage](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/?branch=master)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![SensioLabsInsight](https://insight.sensiolabs.com/projects/ede7cf50-c591-41a0-a6c8-d2e6de4b7131/mini.png)](https://insight.sensiolabs.com/projects/ede7cf50-c591-41a0-a6c8-d2e6de4b7131)
[![Total Downloads](https://img.shields.io/packagist/dt/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/proengsoft/laravel-jsvalidation)

[JQuery Validation Plugin]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.0/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.0/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.0/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.0/localization 
[Validation]: http://laravel.com/docs/5.0/validation 

**Laravel Javascript Validation** allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms transparently in client side **without need to write any Javascript code or use HTML Builder Class**. You can validate forms automatically
 referencing it to your defined validations. The messages are loaded from your validators and translated according your Localization preferences.
 
**All Laravel [Available Validation Rules] (http://laravel.com/docs/5.0/validation#available-validation-rules) are implemented** (except remotes for now)

The [JsValidator](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Class) created by the [Facade](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade) inherits from [Laravel Validation](http://laravel.com/docs/5.0/validation), so you can use all methods and procedures that Laravel provides to 
setup your validations. Also class and rule syntax are the same that Laravel Validation class implements. When the instance is printed in a 
view the Javascript code needed to validate your form is rendered to the page.

The Javascript validations are made using [JQuery Validation Plugin][], that is compiled into javascript in the package.

### Documentation

- [About](https://github.com/proengsoft/laravel-jsvalidation/wiki/Home)
- [Installation](https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation)
- [Configuration](https://github.com/proengsoft/laravel-jsvalidation/wiki/Configuration)
  - [Settings](https://github.com/proengsoft/laravel-jsvalidation/wiki/Settings)
  - [Javascript Rendering](https://github.com/proengsoft/laravel-jsvalidation/wiki/Javascript-Rendering)
  - [Dependencies](https://github.com/proengsoft/laravel-jsvalidation/wiki/Dependencies)
- [Basic Usage](https://github.com/proengsoft/laravel-jsvalidation/wiki/Basic-Usage)
  - [Rulesets](https://github.com/proengsoft/laravel-jsvalidation/wiki/Rulesets)
  - [Form Requests](https://github.com/proengsoft/laravel-jsvalidation/wiki/Form-Requests)
- [Validation Examples](https://github.com/proengsoft/laravel-jsvalidation/wiki/Validating-Forms)
  - [Controller Example](https://github.com/proengsoft/laravel-jsvalidation/wiki/Controller-Validation-Example)
  - [FormRequest Example](https://github.com/proengsoft/laravel-jsvalidation/wiki/FormRequest-Validation-Example)
- [Testing](https://github.com/proengsoft/laravel-jsvalidation/wiki/Testing)
- [Contributing] (https://github.com/proengsoft/laravel-jsvalidation/wiki/Contributing)
- [ChangeLog] (https://github.com/proengsoft/laravel-jsvalidation/blob/master/CHANGELOG.md)
- [Security] (https://github.com/proengsoft/laravel-jsvalidation/wiki/Security)
- [Credits] (https://github.com/proengsoft/laravel-jsvalidation/wiki/Credits)
- [License] (https://github.com/proengsoft/laravel-jsvalidation/blob/master/LICENSE.md)

---

### [Facade Reference](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade)

* [`JsValidator::make()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade#jsvalidatormake) 
* [`JsValidator::formRequest()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade#jsvalidatorformrequest) 
* [`JsValidator::validator()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade#jsvalidatorvalidator)

---

### [JsValidator Class](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Class)
 
* [`Arrayable interface`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Class#arrayable-interface) 
* [`render()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Class#renderview) 
* [`__toString()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Class#__tostring) 

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

