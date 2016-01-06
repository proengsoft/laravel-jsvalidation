<?php

namespace Proengsoft\JsValidation\Remote;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator as BaseValidator;
use Proengsoft\JsValidation\Support\AccessProtectedTrait;
use Proengsoft\JsValidation\Support\RuleListTrait;

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

    public function validate($attribute, $value, $parameters, $validateAll = false)
    {
        $this->validateAll = $validateAll;
        $validationData = $this->parseJsRemoteRequest($attribute, $value, $parameters);
        $validationResult = $this->validateJsRemoteRequest($validationData[1]);
        throw new HttpResponseException(
            new JsonResponse($validationResult, 200));
    }

    /**
     *  Parse Validation input request data.
     *
     * @param $attribute
     * @param $value
     * @param $parameters
     * @return array
     */
    protected function parseJsRemoteRequest($attribute, $value, $parameters)
    {
        parse_str("$value=", $attr_parts);
        $attr_parts = is_null($attr_parts) ? [] : $attr_parts;
        $newAttr = array_keys(Arr::dot($attr_parts));

        return [$attribute, array_pop($newAttr), $parameters];
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
        if (in_array('no_js_validation',$rules)) {
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
