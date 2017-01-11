<?php

namespace Proengsoft\JsValidation\Remote;

use Illuminate\Http\JsonResponse;
use Proengsoft\JsValidation\Support\RuleListTrait;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Validation\Validator as BaseValidator;
use Proengsoft\JsValidation\Support\AccessProtectedTrait;

/**
 * Class RemoteValidator.
 */
class Validator
{
    use AccessProtectedTrait, RuleListTrait;

    /**
     * Validator extension name.
     */
    const EXTENSION_NAME = 'jsvalidation';

    /**
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    /**
     * @var bool
     */
    protected $validateAll = false;

    /**
     * RemoteValidator constructor.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function __construct(BaseValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Force validate all rules.
     *
     * @param $validateAll
     */
    public function setValidateAll($validateAll)
    {
        $this->validateAll = $validateAll;
    }

    /**
     * Validate request.
     *
     * @param $attribute
     * @param $value
     * @param $parameters
     */
    public function validate($attribute, $value, $parameters)
    {
        $validationData = $this->parseJsRemoteRequest($value);

        $validationResult = $this->validateJsRemoteRequest($validationData);
        $this->throwValidationException($validationResult, $this->validator);

    }

    /**
     * Throw the failed validation exception.
     *
     * @param  mixed $result
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Validation\ValidationException|\Illuminate\Http\Exception\HttpResponseException
     */
    protected function throwValidationException($result, $validator) {
        $response =  new JsonResponse($result, 200);

        if ($result!==true && class_exists('\Illuminate\Validation\ValidationException')) {
            throw new \Illuminate\Validation\ValidationException($validator, $response);
        }
        throw new HttpResponseException($response);
    }

    /**
     *  Parse Validation input request data.
     *
     * @param $data
     * @return array
     */
    protected function parseJsRemoteRequest($data)
    {
        parse_str($data, $attrParts);
        $attrParts = is_null($attrParts) ? [] : $attrParts;
        $newAttr = array_keys(array_dot($attrParts));

        return array_pop($newAttr);
    }

    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     * @return array|bool
     */
    protected function validateJsRemoteRequest($attribute)
    {
        $validator = $this->validator;
        $validator = $this->setRemoteValidation($attribute, $validator);

        if ($validator->passes()) {
            return true;
        }

        return $validator->messages()->get($attribute);
    }

    /**
     * Sets data for validate remote rules.
     *
     * @param $attribute
     *
     * @return \Illuminate\Validation\Validator
     */
    protected function setRemoteValidation($attribute, BaseValidator $validator)
    {
        $rules = $validator->getRules();
        $rules = isset($rules[$attribute]) ? $rules[$attribute] : [];
        if (in_array('no_js_validation', $rules)) {
            $validator->setRules([$attribute => []]);

            return $validator;
        }

        $rules = $this->purgeNonRemoteRules($rules, $validator);
        $validator->setRules([$attribute => $rules]);

        return $validator;
    }

    /**
     * Remove rules that should not be validated remotely.
     *
     * @param $rules
     * @param $validator
     * @return mixed
     */
    protected function purgeNonRemoteRules($rules, $validator)
    {
        if ($this->validateAll) {
            return $rules;
        }

        $protectedValidator = $this->createProtectedCaller($validator);

        foreach ($rules as $i => $rule) {
            $parsedRule = call_user_func($protectedValidator, 'parseRule', [$rule]);
            if (! $this->isRemoteRule($parsedRule[0])) {
                unset($rules[$i]);
            }
        }

        return $rules;
    }
}
