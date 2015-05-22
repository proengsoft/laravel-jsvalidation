<?php namespace Proengsoft\JsValidation;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
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
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {

        if (!empty($this->data['_jsvalidation']))
        {
            throw new HttpResponseException(
                $this->jsValidationRemote($this->data['_jsvalidation'])
            );
        }

        return parent::passes();
    }


    protected function setRemoteValidationData($attribute)
    {
        foreach ($this->rules as $attr=>$rules) {
            if ($attr == $attribute) {
                foreach ($rules as $i=>$rule) {
                    if (!$this->isRemoteRule($rule)) {
                        unset($this->rules[$attr][$i]);
                    }
                }
            } else {
                unset($this->rules[$attr]);
            }
        }
    }


    protected function jsValidationRemote($attribute)
    {
        $message=null;
        $this->setRemoteValidationData($attribute);
        if (parent::passes()) {
            $message = true;
        } else {
            $message=$this->messages()->get($attribute);
        }

        return new JsonResponse($message, 200);
    }





}
