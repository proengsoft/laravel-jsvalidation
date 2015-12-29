<?php

namespace Proengsoft\JsValidation\Remote;

use Closure;
use Illuminate\Contracts\Validation\Factory;
use Illuminate\Validation\Validator as BaseValidator;
use Proengsoft\JsValidation\Support\AccessProtectedTrait;

class Resolver
{
    use AccessProtectedTrait;

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
     *
     * @param Factory $factory
     */
    public function __construct(Factory $factory)
    {
        $this->factory = $factory;
        $this->resolver = $this->getProtected($factory, 'resolver');
    }

    /**
     * Closure used to resolve Validator instance.
     *
     * @param $field
     *
     * @return Closure
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
     *
     * @return Validator
     */
    protected function resolve($translator, $data, $rules, $messages, $customAttributes, $field)
    {
        if (is_null($this->resolver)) {
            $validator = new BaseValidator($translator, $data, $rules, $messages, $customAttributes);
        } else {
            $validator = call_user_func($this->resolver, $translator, $data, $rules, $messages, $customAttributes);
        }
        $validator->sometimes($field, Validator::EXTENSION_NAME, function () {
            return true;
        });

        return $validator;
    }

    /**
     * Closure used to trigger JsValidations.
     *
     * @return Closure
     */
    public function validator()
    {
        return function ($attribute, $value, $parameters, $validator) {
            $remoteValidator = new Validator($validator);
            $remoteValidator->validate($attribute, $value, $parameters);
        };
    }
}
