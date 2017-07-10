## [2.0.0] - 2017-07-10

### Added

- Laravel 5.4 support (#224)

### Changed

- Typo in `resources/assets/js/helpers.js` method `gess` fixed. Method renamed to `guess` (#250)

### Fixed

- JPEG mime-type check in `image` rule (#239)

### Removed

- Laravel <= 5.3 support. Will be maintained in 1.x releases (#258)
- PHP < 5.6.4 support (Laravel 5.4 minimum requirement)

## [1.5.0] - 2017-01-22
 
Features:
   - Javascript validation for [File](https://laravel.com/docs/5.3/validation#rule-file) rule
   - Javascript validation for [Mimetypes](https://laravel.com/docs/5.3/validation#rule-mimetypes) rule
   - Javascript validation for [Nullable](https://laravel.com/docs/5.3/validation#rule-nullable) rule
   - Javascript validation for [Filled](https://laravel.com/docs/5.3/validation#rule-filled) rule
   - Javascript validation for [Dimensions](https://laravel.com/docs/5.3/validation#rule-dimensions) rule
   - Javascript validation for [InArray](https://laravel.com/docs/5.3/validation#rule-inarray) rule
   - Javascript validation for [Distinct](https://laravel.com/docs/5.3/validation#rule-distinct) rule

Issues resolved:
  - Fix issue with HttpResponseException (#130)
  - Fix Undefined index: _jsvalidation_validate_all (#201)
 
## [1.4.3] - 2017-01-07

Features:
   - Add support for the "bail" keyword (#179)
   - Add support to validate array fields using non array rules (#180, #158)

Issues resolved:
   - Fix remote custom validation (#175) 
   - File Size doesn't work with JavaScript Validator (#156)

## [1.4.2] - 2016-12-28

Bugfixes:
 - Fix javascript build files

## [1.4.1] - 2016-12-28

Bugfixes:
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
