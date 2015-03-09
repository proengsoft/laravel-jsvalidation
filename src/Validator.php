<?php namespace Proengsoft\JQueryValidation;

use Proengsoft\JQueryValidation\Traits\JavascriptValidator;
use Illuminate\Validation\Validator as BaseValidator;

class Validator extends BaseValidator {
    use JavascriptValidator;
}