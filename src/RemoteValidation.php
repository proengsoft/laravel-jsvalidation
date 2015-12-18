<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Validation\Validator;
use Proengsoft\JsValidation\Traits\AccessProtected;
use Proengsoft\JsValidation\Traits\RuleList;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Class RemoteValidator
 * @package Proengsoft\JsValidation
 */
class RemoteValidation
{
    use AccessProtected, RuleList;

    /**
     *
     */
    const EXTENSION_NAME = 'jsvalidation';

    /**
     * @var Closure
     */
    protected $resolver;

    /**
     * @var Factory
     */
    protected $factory;


    /**
     * RemoteValidator constructor.
     * @param Factory $factory
     */
    public function __construct(Factory $factory)
    {
        $this->factory = $factory;
        $this->resolver = $this->getProtected($factory, 'resolver');
    }


    /**
     * Closure used to resolve Validator instance
     *
     * @param $field
     * @return Closure
     */
    public function resolver($field) {

        return function ($translator, $data, $rules, $messages, $customAttributes) use ($field) {
            return $this->resolve($translator, $data, $rules, $messages, $customAttributes, $field);
        };

    }

    /**
     * Resolves Validator instance
     *
     * @param $translator
     * @param $data
     * @param $rules
     * @param $messages
     * @param $customAttributes
     * @param $field
     * @return Validator;
     */
    protected function resolve($translator, $data, $rules, $messages, $customAttributes, $field) {


        if (is_null($this->resolver)) {
            $validator = new Validator($translator, $data, $rules, $messages, $customAttributes);
        } else {
            $validator = call_user_func($this->resolver, $translator, $data, $rules, $messages, $customAttributes);
        }
        $validator->sometimes($field, self::EXTENSION_NAME, function () {
            return true;
        });

        return $validator;
    }


    /**
     * Closure used to trigger JsValidations
     *
     * @return Closure
     */
    public function validator() {

        return function ($attribute, $value, $parameters, $validator) {
            $attribute = $this->parseJsRemoteRequest($attribute, $value, $parameters);
            $this->validateJsRemoteRequest($attribute, $validator);
        };
    }


    protected function parseJsRemoteRequest($attribute, $value, $parameters) {
        parse_str("$value=",$attr_parts);
        $newAttr = array_keys(Arr::dot($attr_parts));
        return array_pop($newAttr);
    }


    /**
     * Validate remote Javascript Validations.
     *
     * @param $attribute
     * @param Validator $validator
     */
    protected function validateJsRemoteRequest($attribute, Validator $validator)
    {
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
     * @return Validator
     */
    protected function setRemoteValidation($attribute, Validator $validator)
    {

        if (! array_key_exists($attribute, $validator->getRules())) {
            throw new BadRequestHttpException("Undefined '$attribute' attribute");
        }

        $rules = $validator->getRules()[$attribute];
        $disabled = $this->validationDisabled($rules);
        $protectedValidator = $this->createProtectedCaller($validator);

        foreach ($rules as $i => $rule) {
            $parsedRule = call_user_func($protectedValidator,'parseRule',[$rule]);
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