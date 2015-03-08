<?php namespace Proengsoft\JQueryValidation;

namespace Proengsoft\JQueryValidation\Traits;
use Illuminate\Validation\Validator as BaseValidator;


class Validator extends BaseValidator {
    use JavascriptValidator;

}