# Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/proengsoft/laravel-jsvalidation)
[![SensioLabsInsight](https://insight.sensiolabs.com/projects/ede7cf50-c591-41a0-a6c8-d2e6de4b7131/mini.png)](https://insight.sensiolabs.com/projects/ede7cf50-c591-41a0-a6c8-d2e6de4b7131)

[JQuery Validation Plugin]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.0/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.0/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.0/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.0/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.0/localization 
[Validation]: http://laravel.com/docs/5.0/validation 

**Laravel Javascript Validation** allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms 

 transparently in client side using Javascript. You can validate forms automatically
 referencing it to your defined validations. The messages are loaded from your validators and translated according your Localization preferences.
 
This package ships with a simple, convenient facility for configuring rules error messages via the `JsValidator` facade.

The `JsValidator` created by the *Facade* inherits from [Laravel Validation][], so you can use all methods and procedures that Laravel provides to 
setup your validations. Also class and rule syntax are the same that Laravel Validation class implements. When the instance is printed in a 
view the Javascript code needed to validate your form is rendered to the page.

The Javascript validations are made using [JQuery Validation Plugin][], that is compiled into javascript in the package.

### Documentation

- [About](Home)
- [Installation](Installation)
- [Configuration](Configuration)
  - [Settings](Settings)
  - [Javascript Rendering](Javascript-Rendering)
  - [Dependencies](Dependencies)
- [Basic Usage](Basic-Usage)
  - [Rulesets](Rulesets)
  - [Form Requests](Form-Requests)
- [Validation Examples](Validating-Forms)
  - [Controller Example](Controller-Validation-Example)
  - [FormRequest Example](FormRequest-Validation-Example)
- [Testing](Testing)
- [Contributing] (Contributing)
- [Changelog] (https://github.com/proengsoft/laravel-jsvalidation/blob/master/CHANGELOG.md)
- [Security] (Security)
- [Credits] (Credits)
- [License] (https://github.com/proengsoft/laravel-jsvalidation/blob/master/LICENSE.md)

---

### [Facade Reference](Facade)

* [`JsValidator::make()`](Facade#jsvalidatormake) 
* [`JsValidator::formRequest()`](Facade#jsvalidatorformrequest) 
* [`JsValidator::validator()`](Facade#jsvalidatorvalidator)

---

### [JsValidator Class](JsValidator-Class)
 
* [`Arrayable interface`](JsValidator-Class#arrayableinterface) 
* [`render()`](JsValidator-Class#render) 
* [`__toString()`](JsValidator-Class#tostring) 
## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

