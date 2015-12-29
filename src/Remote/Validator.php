<?php

namespace Proengsoft\JsValidation\Remote;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator as BaseValidator;
use Proengsoft\JsValidation\Exceptions\BadRequestHttpException;
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

    /**
     * RemoteValidator constructor.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function __construct(BaseValidator $validator)
    {
        $this->validator = $validator;
    }

    public function validate($attribute, $value, $parameters)
    {
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
        if (! array_key_exists($attribute, $validator->getRules())) {
            throw new BadRequestHttpException("Undefined '$attribute' attribute");
        }

        $rules = $validator->getRules()[$attribute];
        $rules = $this->purgeNonRemoteRules($rules, $validator);
        $validator->setRules([$attribute => $rules]);

        if (empty($validator->getRules()[$attribute])) {
            throw new BadRequestHttpException("No validations available for '$attribute'");
        }

        return $validator;
    }

    protected function purgeNonRemoteRules($rules, $validator)
    {
        $disabled = $this->validationDisabled($rules);
        $protectedValidator = $this->createProtectedCaller($validator);

        foreach ($rules as $i => $rule) {
            $parsedRule = call_user_func($protectedValidator, 'parseRule', [$rule]);
            if ($disabled || ! $this->isRemoteRule($parsedRule[0])) {
                unset($rules[$i]);
            }
        }

        return $rules;
    }
}
