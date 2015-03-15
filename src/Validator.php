<?php namespace Proengsoft\JsValidation;

use Proengsoft\JsValidation\Traits\JavascriptValidator;
use Illuminate\Validation\Validator as BaseValidator;

/**
 * Extends Laravel Validator to add Javascript Validations
 *
 * Class Validator
 * @package Proengsoft\JsValidation
 */
class Validator extends BaseValidator
{
    use JavascriptValidator;
}
