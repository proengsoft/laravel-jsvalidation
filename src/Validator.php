<?php namespace Proengsoft\JsValidation;

use Illuminate\Support\Facades\Request;
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

    /**
     * Determine if the data fails the validation rules.
     *
     * @return bool
     */
    public function fails()
    {
        if (Request::input('__jsvalidation'))
        {

        }

        return parent::fails();
    }


}
