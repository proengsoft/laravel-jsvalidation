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
     * RemoteValidator constructor.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function __construct(BaseValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Validate request.
     *
     * @param $field
     * @param $parameters
     */
    public function validate($field, $parameters = [])
    {
        $attribute = $this->parseAttributeName($field);
        $validationParams = $this->parseParameters($parameters);
        $validationResult = $this->validateJsRemoteRequest($attribute, $validationParams);

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
    protected function throwValidationException($result, $validator)
    {
        $response = new JsonResponse($result, 200);

        if ($result !== true && class_exists('\Illuminate\Validation\ValidationException')) {
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
    protected function parseAttributeName($data)
    {
        parse_str($data, $attrParts);
        $attrParts = is_null($attrParts) ? [] : $attrParts;
        $newAttr = array_keys(array_dot($attrParts));

        return array_pop($newAttr);
    }

    /**
     *  Parse Validation parameters.
     *
     * @param $parameters
     * @return array
     */
    protected function parseParameters($parameters)
    {
        $newParams = ['validate_all' => false];
        if (isset($parameters[0])) {
            $newParams['validate_all'] = ($parameters[0] === 'true') ? true : false;
        }

        return $newParams;
    }

    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     * @param array $parameters
     * @return array|bool
     */
    protected function validateJsRemoteRequest($attribute, $parameters)
    {
        $this->setRemoteValidation($attribute, $parameters['validate_all']);

        $validator = $this->validator;
        if ($validator->passes()) {
            return true;
        }

        return $validator->messages()->get($attribute);
    }

    /**
     * Sets data for validate remote rules.
     *
     * @param $attribute
     * @param bool $validateAll
     */
    protected function setRemoteValidation($attribute, $validateAll = false)
    {
        $validator = $this->validator;
        $rules = $validator->getRules();
        $rules = isset($rules[$attribute]) ? $rules[$attribute] : [];
        if (in_array('no_js_validation', $rules)) {
            $validator->setRules([$attribute => []]);

            return;
        }
        if (! $validateAll) {
            $rules = $this->purgeNonRemoteRules($rules, $validator);
        }
        $validator->setRules([$attribute => $rules]);
    }

    /**
     * Remove rules that should not be validated remotely.
     *
     * @param $rules
     * @param BaseValidator $validator
     * @return mixed
     */
    protected function purgeNonRemoteRules($rules, $validator)
    {
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
