# Laravel 5 Javascript Validation

[![Latest Version](https://img.shields.io/github/release/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://github.com/proengsoft/laravel-jsvalidation/releases)
[![Build Status](https://img.shields.io/travis/proengsoft/laravel-jsvalidation/master.svg?style=flat-square)](https://travis-ci.org/proengsoft/laravel-jsvalidation)
[![Code Coverage](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation/?branch=master)
[![Quality Score](https://img.shields.io/scrutinizer/g/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://scrutinizer-ci.com/g/proengsoft/laravel-jsvalidation)
[![Total Downloads](https://img.shields.io/packagist/dt/proengsoft/laravel-jsvalidation.svg?style=flat-square)](https://packagist.org/packages/proengsoft/laravel-jsvalidation)

[JQuery Validation Plugin]: http://jqueryvalidation.org/
[FormRequest]: http://laravel.com/docs/5.1/validation#form-request-validation
[Validators]: http://laravel.com/docs/5.1/validation#form-request-validation
[Validation Rules]: http://laravel.com/docs/5.1/validation#available-validation-rules
[Custom Validations]: http://laravel.com/docs/5.1/validation#custom-validation-rules
[Messages]: http://laravel.com/docs/5.1/validation#error-messages-and-views
[Laravel Localization]: http://laravel.com/docs/5.1/localization
[Validation]: http://laravel.com/docs/5.1/validation
[Custom Validation Rules]: http://laravel.com/docs/5.1/validation#custom-validation-rules

**Laravel Javascript Validation** allows to reuse your Laravel [Validation Rules][], [Messages][], [FormRequest][] and [Validators][] to validate forms transparently in client side **without need to write any Javascript code or use HTML Builder Class**. You can validate forms automatically
 referencing it to your defined validations. The messages are loaded from your validators and translated according your Localization preferences.
 
**All Laravel [Validation Rules][]  and [Custom Validation Rules][] are supported**. [ActiveURL](http://laravel.com/docs/5.1/validation#rule-active-url),
[Unique](http://laravel.com/docs/5.1/validation#rule-unique), [Exists](http://laravel.com/docs/5.1/validation#rule-exists) and [Custom Validation Rules][]
are validated automatically via Ajax.

The [JsValidator](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference) created by the [Facade](https://github.com/proengsoft/laravel-jsvalidation/wiki/Facade) inherits from [Laravel Validation](http://laravel.com/docs/5.0/validation), so you can use all methods and procedures that Laravel provides to
setup your validations. Also class and rule syntax are the same that Laravel Validation class implements. When the instance is printed in a 
view the Javascript code needed to validate your form is rendered to the page.

The Javascript validations are made using [JQuery Validation Plugin][], that is compiled into javascript in the package.

##### Upgrade notice

**If you are upgrading this package from release older than [v1.2.0 (2015-08-19)](https://github.com/proengsoft/laravel-jsvalidation/releases/tag/v1.2.0) follow the
[Upgrade Guide] (https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation#upgrade-from-previous-versions) and update your `composer.json` file to make
sure that your Javascript assets are updated correctly.**

### Documentation

- [About](https://github.com/proengsoft/laravel-jsvalidation/wiki/Home)
- [Installation](https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation)
  - [Upgrade] (https://github.com/proengsoft/laravel-jsvalidation/wiki/Installation#upgrade-from-previous-versions)
- [Configuration](https://github.com/proengsoft/laravel-jsvalidation/wiki/Configuration)
  - [Settings](https://github.com/proengsoft/laravel-jsvalidation/wiki/Settings)
  - [Javascript Rendering](https://github.com/proengsoft/laravel-jsvalidation/wiki/Javascript-Rendering)
  - [Dependencies](https://github.com/proengsoft/laravel-jsvalidation/wiki/Dependencies)
- [Basic Usage](https://github.com/proengsoft/laravel-jsvalidation/wiki/Basic-Usage)
  - [Laravel Rules](https://github.com/proengsoft/laravel-jsvalidation/wiki/Rules)
  - [Form Requests](https://github.com/proengsoft/laravel-jsvalidation/wiki/Form-Requests)
- [Validation Examples](https://github.com/proengsoft/laravel-jsvalidation/wiki/Validating-Examples)
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

### [JsValidator Reference](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference)
 
* [`selector()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference#selectorselector)
* [`view()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference#viewview)
* [`render()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference#renderview-selector)
* [`Arrayable interface`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference#arrayable-interface)
* [`__toString()`](https://github.com/proengsoft/laravel-jsvalidation/wiki/JsValidator-Reference#__tostring)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

