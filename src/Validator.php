<?php namespace Proengsoft\JQueryValidation;

use Proengsoft\JQueryValidation\Traits\JavascriptValidator;
use Illuminate\Validation\Validator as BaseValidator;

/**
 * Extends Laravel Validator to add Javascript Validations
 *
 * Class Validator
 * @package Proengsoft\JQueryValidation
 */
class Validator extends BaseValidator
{
    use JavascriptValidator;
}
