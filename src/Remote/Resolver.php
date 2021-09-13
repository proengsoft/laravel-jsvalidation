<?php

namespace Proengsoft\JsValidation\Remote;

use Illuminate\Contracts\Validation\Factory as ValidationFactory;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator as BaseValidator;
use Proengsoft\JsValidation\Support\AccessProtectedTrait;

class Resolver
{
    use AccessProtectedTrait;

    /**
     * @var \Closure
     */
    protected $resolver;

    /**
     * @var \Illuminate\Contracts\Validation\Factory
     */
    protected $factory;

    /**
     * Whether to escape validation messages.
     *
     * @var bool
     */
    protected $escape;

    /**
     * RemoteValidator constructor.
     *
     * @param  \Illuminate\Contracts\Validation\Factory  $factory
     * @param  bool  $escape
     */
    public function __construct(ValidationFactory $factory, $escape = false)
    {
        $this->factory = $factory;
        $this->resolver = $this->getProtected($factory, 'resolver');
        $this->escape = $escape;
    }

    /**
     * Closure used to resolve Validator instance.
     *
     * @param $field
     * @return \Closure
     */
    public function resolver($field)
    {
        return function ($translator, $data, $rules, $messages, $customAttributes) use ($field) {
            return $this->resolve($translator, $data, $rules, $messages, $customAttributes, $field);
        };
    }

    /**
     * Resolves Validator instance.
     *
     * @param $translator
     * @param $data
     * @param $rules
     * @param $messages
     * @param $customAttributes
     * @param $field
     * @return \Illuminate\Validation\Validator
     */
    protected function resolve($translator, $data, $rules, $messages, $customAttributes, $field)
    {
        $validateAll = Arr::get($data, $field.'_validate_all', false);
        $validationRule = 'bail|'.Validator::EXTENSION_NAME.':'.$validateAll;
        $rules = [$field => $validationRule] + $rules;
        $validator = $this->createValidator($translator, $data, $rules, $messages, $customAttributes);

        return $validator;
    }

    /**
     * Create new validator instance.
     *
     * @param $translator
     * @param $data
     * @param $rules
     * @param $messages
     * @param $customAttributes
     * @return \Illuminate\Validation\Validator
     */
    protected function createValidator($translator, $data, $rules, $messages, $customAttributes)
    {
        if (is_null($this->resolver)) {
            return new BaseValidator($translator, $data, $rules, $messages, $customAttributes);
        }

        return call_user_func($this->resolver, $translator, $data, $rules, $messages, $customAttributes);
    }

    /**
     * Closure used to trigger JsValidations.
     *
     * @return \Closure
     */
    public function validatorClosure()
    {
        return function ($attribute, $value, $parameters, BaseValidator $validator) {
            $remoteValidator = new Validator($validator, $this->escape);
            $remoteValidator->validate($value, $parameters);

            return $attribute;
        };
    }
}
