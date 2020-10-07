# Changelog

All notable changes to `laravel-jsvalidation` will be documented in this file.

## [4.4.0](https://github.com/proengsoft/laravel-jsvalidation/compare/4.3.1...4.4.0) - 2020-10-07

Added experimental form request validation.
All validation occurs via AJAX request on form submission. This resolves a number of issues
regarding form request usage and unimplemented client side rules.
See the PR for details on usage.

### Improvements
* **Experimental** - Improved form request validation - [#505](https://github.com/proengsoft/laravel-jsvalidation/pull/505)

## [4.3.1](https://github.com/proengsoft/laravel-jsvalidation/compare/4.3.0...4.3.1) - 2020-10-03

### Improvements
* Bump locutus from 2.0.12 to 2.0.14 [#506](https://github.com/proengsoft/laravel-jsvalidation/pull/506)

## [4.3.0](https://github.com/proengsoft/laravel-jsvalidation/compare/4.2.0...4.3.0) - 2020-09-08

### Improvements
* Allow type-hint any dependencies in rules() [#496](https://github.com/proengsoft/laravel-jsvalidation/pull/496) - thanks to [@thewebartisan7](https://github.com/thewebartisan7) :tada:

## [4.2.0](https://github.com/proengsoft/laravel-jsvalidation/compare/4.1.0...4.2.0) - 2020-09-03

### Improvements
* Updated php-date-formatter from 1.3.4 to 1.3.6 [#467](https://github.com/proengsoft/laravel-jsvalidation/pull/467)
* Updated locutus from 2.0.11 to 2.0.12 [#489](https://github.com/proengsoft/laravel-jsvalidation/pull/489)

## [4.1.0](https://github.com/proengsoft/laravel-jsvalidation/compare/4.0.0...4.1.0) - 2020-06-25

### Improvements
* Updated phpjs dependency [#445](https://github.com/proengsoft/laravel-jsvalidation/pull/445)
* Updated jquery-validation dependency to 1.19.2 [#451](https://github.com/proengsoft/laravel-jsvalidation/pull/451)
* Replaced deprecated jQuery functions [#458](https://github.com/proengsoft/laravel-jsvalidation/pull/458)
* Laravel 8 support [#462](https://github.com/proengsoft/laravel-jsvalidation/pull/462)

### Bug Fixes
* Fixed array rule validation against select-multiple elements [#454](https://github.com/proengsoft/laravel-jsvalidation/pull/454)

## [4.0.0](https://github.com/proengsoft/laravel-jsvalidation/compare/3.0.1...4.0.0) - 2020-04-24

### Breaking Changes
* Content editable elements are now ignored when validating. This can be changed in the configuration file.
* URL validation is no longer performed on the client side and instead uses an AJAX request
* Validation messages containing HTML are now escaped to prevent XSS. This can be changed in the configuration file.
* `jsvalidation.js.map` is no longer included. If you need it, please generate it yourself.

### Improvements
* Switched to GitHub Actions [#431](https://github.com/proengsoft/laravel-jsvalidation/pull/431)
* Added Orchestra Test Bench [#430](https://github.com/proengsoft/laravel-jsvalidation/pull/430)
* Switched to Laravel Mix [#441](https://github.com/proengsoft/laravel-jsvalidation/pull/441)
* Validation messages containing HTML are now escaped [#443](https://github.com/proengsoft/laravel-jsvalidation/pull/443)

### Bug Fixes
* Fixed inconsistent URL validation [#435](https://github.com/proengsoft/laravel-jsvalidation/pull/435)
* Fixed contenteditable validation [#434](https://github.com/proengsoft/laravel-jsvalidation/pull/434)
* Fixed array wildcard validation [#432](https://github.com/proengsoft/laravel-jsvalidation/pull/432)

## [3.0.1](https://github.com/proengsoft/laravel-jsvalidation/compare/3.0.0...3.0.1) - 2020-04-10

**Docblock Fixes:**
* [#426](https://github.com/proengsoft/laravel-jsvalidation/pull/426) (Thanks to @yepzy)

## [3.0.0](https://github.com/proengsoft/laravel-jsvalidation/compare/2.5.0...3.0.0) - 2020-03-15

**Drops support for Laravel 5.4 and 5.5**

### New features
* uikit support [#395](https://github.com/proengsoft/laravel-jsvalidation/pull/395)
* Laravel 7.x support [#415](https://github.com/proengsoft/laravel-jsvalidation/pull/415)
* Ability to escape validation messages [#329](https://github.com/proengsoft/laravel-jsvalidation/pull/329)
* `withJsValidator` support [#418](https://github.com/proengsoft/laravel-jsvalidation/pull/418)
* `before_or_equal` and `after_or_equal` validation rule support [#421](https://github.com/proengsoft/laravel-jsvalidation/pull/421)

### Improvements
* Updated jquery-validation to latest [#409](https://github.com/proengsoft/laravel-jsvalidation/pull/409)

### Bug fixes
* [#245](https://github.com/proengsoft/laravel-jsvalidation/issues/245), PR [#330](https://github.com/proengsoft/laravel-jsvalidation/pull/330)
* [#333](https://github.com/proengsoft/laravel-jsvalidation/issues/333), PR [#334](https://github.com/proengsoft/laravel-jsvalidation/pull/334)
* [#364](https://github.com/proengsoft/laravel-jsvalidation/issues/364), PR [#419](https://github.com/proengsoft/laravel-jsvalidation/pull/419)
* [#323](https://github.com/proengsoft/laravel-jsvalidation/issues/323), PR [#420](https://github.com/proengsoft/laravel-jsvalidation/pull/420)

## [2.5.0] - 2019-09-06

### Added

- ([#391]) Laravel 6 support

## [2.4.0] - 2019-03-17

### Added

- ([#373]) Laravel 5.8 support

## [2.3.2] - 2018-10-06

### Fixed

- ([#354]) Bootstrap 4 support

## [2.3.1] - 2018-09-06

### Added

- ([#345]) Laravel 5.7 support

## [2.3.0] - 2018-07-19

### Added

- ([#337]) Validate each form with same selector

### Fixed

- ([#319]) Fix custom rules

## [2.2.3] - 2018-05-17

### Added

- ([#325]) Added Bootstrap 4 support

### Fixed

- ([#312]) Array validation rule fixed

## [2.2.2] - 2018-04-18

### Fixed

- ([#316], [#317]) Array rule validation

## [2.2.1] - 2018-02-27

### Fixed

- ([#307]) Fix images, mimetypes & files rules in Laravel 5.6

## [2.2.0] - 2018-02-09

### Added

- ([#302]) Laravel 5.6 support

## [2.1.0] - 2017-08-31

### Added

- ([#277]) Laravel 5.5 support

## [2.0.0] - 2017-07-10

### Added

- ([#224]) Laravel 5.4 support

### Changed

- ([#250]) Typo in `resources/assets/js/helpers.js` method `gess` fixed. Method renamed to `guess`

### Fixed

- ([#239]) JPEG mime-type check in `image` rule

### Removed

- ([#258]) Laravel <= 5.3 support. Will be maintained in 1.x releases
- PHP < 5.6.4 support (Laravel 5.4 minimum requirement)

## [1.5.0] - 2017-01-22
 
### Added

- Javascript validation for [File](https://laravel.com/docs/5.3/validation#rule-file) rule
- Javascript validation for [Mimetypes](https://laravel.com/docs/5.3/validation#rule-mimetypes) rule
- Javascript validation for [Nullable](https://laravel.com/docs/5.3/validation#rule-nullable) rule
- Javascript validation for [Filled](https://laravel.com/docs/5.3/validation#rule-filled) rule
- Javascript validation for [Dimensions](https://laravel.com/docs/5.3/validation#rule-dimensions) rule
- Javascript validation for [InArray](https://laravel.com/docs/5.3/validation#rule-inarray) rule
- Javascript validation for [Distinct](https://laravel.com/docs/5.3/validation#rule-distinct) rule

### Fixed

- (#130) Fix issue with HttpResponseException
- (#201) Fix Undefined index: _jsvalidation_validate_all
 
## [1.4.3] - 2017-01-07

### Added

- (#179) Add support for the "bail" keyword
- (#180, #158) Add support to validate array fields using non array rules

### Fixed

- (#175) Fix remote custom validation 
- (#156) File Size doesn't work with JavaScript Validator

## [1.4.2] - 2016-12-28

### Fixed

- Fix javascript build files

## [1.4.1] - 2016-12-28

### Fixed

- Fix javascript build files

## [1.4.0] - 2016-12-28

Bugfixes:

 - Features:
     - Support for Laravel [Conditional Rules](https://laravel.com/docs/5.2/validation#conditionally-adding-rules)
     - Support for [Array Validations](https://laravel.com/docs/5.2/validation#validating-arrays)
     - Support for [RequiredUnless](https://laravel.com/docs/5.2/validation#rule-required-unless) Rule

 - Issues resolved:
     - Convert Exceptions to E_USER_ERROR in __toString() (#126)
     - Chrome and IE case fix in mime types (PR #136) 
     - Fix Turn off remote validation (#145)
     - Support for Laravel 5.3.21 and greater

## [1.3.1] - 2016-01-04

Features:
 - Allow Dependency Injection in FormRequest Validations
 - Add extra field values to ajax request on remote validation (#88, #99)

## [1.3.0] - 2015-12-29

Features:
 - Add ignore method to override default configuration
 - Add remote_validation_field config option
 - Allow using with other validation packages
 - Improved performance and refactoring

Bugfixes:

 - Issues resolved:
    - Critical error with numeric min & max values (#98) 
    - Error when using FormRequest validation (#96)
    - Conflict with other Laravel functionality? (#90)
    - Multiple Instances of JSValidation (#87)
    - Error when using FormRequest validation (#96) 

## [1.2.0] - 2015-09-30

Features:

 - Allow validate rule "In" for type array 
 - Added JSON validator [3f508c1](https://github.com/laravel/framework/commit/3f508c1c88897bd6b8fe15137ec77d3023bbcd9f#diff-38fd116b7c7b8ac1bdd8362250d04d57)
 - Allow disable remote validations
 - Add support for other validation packages (#69)

Bugfixes:

 - Issues resolved:
    - Fix some validations when field is array (#75) 
    - Updated validateAlpha logic [c31a38d](https://github.com/laravel/framework/commit/c31a38d596c1913696ace0cd77201cf675748fe8)

## [1.1.4] - 2015-09-10

Bugfixes:

 - Issues resolved:
    -  String validation fails on length (#71)
    -  Default validation messages can't be changed (#27)

## [1.1.3] - 2015-09-07

Bugfixes:

 - Issues resolved:
    - DateFormat generate javascript error if date is not valid

## [1.1.2] - 2015-09-05

Features:

 - Automatic update for public Javascript assets
 - Minor Javascript improvements.
 - Support multidimensional array validation

Bugfixes:

 - Issues resolved:
    - Wrong password confirmed rule conversion (#52)
    - Fix numeric check for min/max validation (#54)
	- Validate PUT/PATCH methods on remote (#69)
	- Hidden input raising an error (#58)
	- Non radio-list show error messages from other radio-list (#57) 
	- date_format:m rule always return not valid (#66) 

## [1.1.1] - 2015-08-15

Bugfixes: 

 - Issues resolved:
     - Rules that depends from other rules they are not validated in some cases (#47)
     - Route Model Binding Form Request Validation Error (#44)

## [1.1.0] - 2015-08-11

Features:

 - ActiveURL, Unique and Exists rules support
 - Support for Custom Validation Rules
 - Multiple forms support improved

Bugfixes:

 - Issues resolved:
   -  Some bugs resolved (#14, #17, #26, #29, #38, #39)

## [1.0.5] - 2015-06-13

Features:

 - Laravel 5.1 support

## [1.0.4] - 2015-05-09

Refactoring:

 - Renamed JsValidation class name to avoid problems with IDE's code completion

## [1.0.3] - 2015-04-11

Bugfixes:

 - Input custom attributes from Requests are not applied.

## [1.0.2] - 2015-03-27

Features:

 - Allow disable validations for certain attributes
 - Unit testing

Bugfixes:

 - The config key form_selector is not loaded when package boots

## [1.0.1] - 2015-03-17

Bufixes:

 - jQuery Validation Plugin debug doesn't work. disabled
 
## 1.0.0 - 2015-03-17

Features:
 
 - Automatic creation of javascript validation based on your Validation Rules, Messages, FormRequest and Validators.
 - The package uses Jquery Validation Plugin bundled in provided script.
 - Unobtrusive integration, you can use independently of Laravel Form Builder. and no Javascript coding required.
 - Uses Laravel Localization to translate messages
 - Can be configured in controllers or views.
 
[2.5.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.4.0...2.5.0
[2.4.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.3.2...2.4.0
[2.3.2]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.3.1...2.3.2
[2.3.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.3.0...2.3.1
[2.3.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.2.3...2.3.0
[2.2.3]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.2.2...2.2.3
[2.2.2]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.2.1...2.2.2
[2.2.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v2.1.0...2.2.0
[2.1.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.4.3...v1.5.0
[1.4.3]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/proengsoft/laravel-jsvalidation/compare/v1.0.0...v1.0.1

[#391]: https://github.com/proengsoft/laravel-jsvalidation/pull/391
[#373]: https://github.com/proengsoft/laravel-jsvalidation/pull/373
[#354]: https://github.com/proengsoft/laravel-jsvalidation/pull/354
[#345]: https://github.com/proengsoft/laravel-jsvalidation/pull/345
[#337]: https://github.com/proengsoft/laravel-jsvalidation/pull/337
[#325]: https://github.com/proengsoft/laravel-jsvalidation/pull/325
[#319]: https://github.com/proengsoft/laravel-jsvalidation/pull/319
[#317]: https://github.com/proengsoft/laravel-jsvalidation/pull/317
[#316]: https://github.com/proengsoft/laravel-jsvalidation/pull/316
[#312]: https://github.com/proengsoft/laravel-jsvalidation/pull/312
[#307]: https://github.com/proengsoft/laravel-jsvalidation/pull/307
[#302]: https://github.com/proengsoft/laravel-jsvalidation/pull/302
[#277]: https://github.com/proengsoft/laravel-jsvalidation/pull/277
[#250]: https://github.com/proengsoft/laravel-jsvalidation/pull/250
[#239]: https://github.com/proengsoft/laravel-jsvalidation/pull/239
[#224]: https://github.com/proengsoft/laravel-jsvalidation/pull/224
[#258]: https://github.com/proengsoft/laravel-jsvalidation/pull/258
