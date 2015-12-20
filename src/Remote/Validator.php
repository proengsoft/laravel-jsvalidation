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
        $this->validateJsRemoteRequest($validationData[1]);
    }

    /**
     *  Parse Validation input request data.
     *
     * @param $attribute
     * @param $value
     * @param $parameters
     *
     * @return array
     */
    protected function parseJsRemoteRequest($attribute, $value, $parameters)
    {
        $attr_parts = array();
        parse_str("$value=", $attr_parts);
        $newAttr = array_keys(Arr::dot($attr_parts));

        return [$attribute, array_pop($newAttr), $parameters];
    }

    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     */
    protected function validateJsRemoteRequest($attribute)
    {
        $validator = $this->validator;
        $validator = $this->setRemoteValidation($attribute, $validator);

        if ($validator->passes()) {
            $message = true;
        } else {
            $message = $validator->messages()->get($attribute);
        }

        throw new HttpResponseException(
            new JsonResponse($message, 200));
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
        if (!array_key_exists($attribute, $validator->getRules())) {
            throw new BadRequestHttpException("Undefined '$attribute' attribute");
        }

        $rules = $validator->getRules()[$attribute];
        $disabled = $this->validationDisabled($rules);
        $protectedValidator = $this->createProtectedCaller($validator);

        foreach ($rules as $i => $rule) {
            $parsedRule = call_user_func($protectedValidator, 'parseRule', [$rule]);
            if ($disabled || !$this->isRemoteRule($parsedRule[0])) {
                unset($rules[$i]);
            }
        }
        $validator->setRules([$attribute => $rules]);

        if (empty($validator->getRules())) {
            throw new BadRequestHttpException("No validations available for '$attribute''");
        }

        return $validator;
    }
}
