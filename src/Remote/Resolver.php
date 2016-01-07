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
        $validator = $this->createValidator($translator, $data, $rules, $messages, $customAttributes);

        $validator->sometimes($field, Validator::EXTENSION_NAME, function () {
            return true;
        });

        return $validator;
    }

    /**
     * Create new validator instance
     *
     * @param $translator
     * @param $data
     * @param $rules
     * @param $messages
     * @param $customAttributes
     * @return BaseValidator
     */
    protected function createValidator($translator, $data, $rules, $messages, $customAttributes) {

        if (is_null($this->resolver)) {
            return new BaseValidator($translator, $data, $rules, $messages, $customAttributes);
        }

        return call_user_func($this->resolver, $translator, $data, $rules, $messages, $customAttributes);
    }

    /**
     * Closure used to trigger JsValidations.
     *
     * @return Closure
     */
    public function validator()
    {
        return function ($attribute, $value, $parameters, BaseValidator $validator) {

            $data = $validator->getData();
            $validateAll = $data[$attribute.'_validate_all'];
            $remoteValidator = new Validator($validator);
            $remoteValidator->validate($attribute, $value, $parameters, $validateAll);
        };
    }
}
