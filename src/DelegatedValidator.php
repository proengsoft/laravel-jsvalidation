<?php

namespace Proengsoft\JsValidation;

use Closure;
use Illuminate\Validation\Validator as BaseValidator;

class DelegatedValidator
{
    /**
     * The Validator resolved instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    /**
     *  Create new instance that delegate calls to Validator.
     * @param BaseValidator $validator
     */
    public function __construct(BaseValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Get current \Illuminate\Validation\Validator instance.
     *
     * @return BaseValidator
     */
    public function getValidator()
    {
        return $this->validator;
    }

    /**
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {
        return $this->validator->passes();
    }

    /**
     * Get the data under validation.
     *
     * @return array
     */
    public function getData()
    {
        return $this->validator->getData();
    }

    /**
     * Get the message container for the validator.
     *
     * @return \Illuminate\Support\MessageBag
     */
    public function messages()
    {
        return $this->validator->messages();
    }

    /**
     * Get the validation rules.
     *
     * @return array
     */
    public function getRules()
    {
        return $this->validator->getRules();
    }

    /**
     * Set the validation rules.
     *
     * @param  array  $rules
     * @return \Illuminate\Validation\Validator
     */
    public function setRules(array $rules)
    {
        return $this->validator->setRules($rules);
    }

    /**
     * Get the array of custom validator extensions.
     *
     * @return array
     */
    public function getExtensions()
    {
        return $this->validator->getExtensions();
    }

    /**
     * Get the files under validation.
     *
     * @return array
     */
    public function getFiles()
    {
        return $this->validator->getFiles();
    }

    /**
     * Set the files under validation.
     *
     * @param  array  $files
     * @return BaseValidator
     */
    public function setFiles(array $files)
    {
        return $this->validator->setFiles($files);
    }

    /**
     * Get the array of custom validator message replacers.
     *
     * @return array
     */
    public function getReplacers()
    {
        return $this->validator->getReplacers();
    }

    /**
     * Determine if a given rule implies the attribute is required.
     *
     * @param  string  $rule
     * @return bool
     */
    public function isImplicit($rule)
    {
        return $this->callProtected('isImplicit', [$rule]);
    }

    /**
     * Replace all error message place-holders with actual values.
     *
     * @param  string  $message
     * @param  string  $attribute
     * @param  string  $rule
     * @param  array   $parameters
     * @return string
     */
    public function doReplacements($message, $attribute, $rule, $parameters)
    {
        return $this->callProtected('doReplacements', [$message, $attribute, $rule, $parameters]);
    }

    /**
     * Determine if the given attribute has a rule in the given set.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @return bool
     */
    public function hasRule($attribute, $rules)
    {
        return $this->callProtected('hasRule', [$attribute, $rules]);
    }

    /**
     * Get the validation message for an attribute and rule.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return string
     */
    public function getMessage($attribute, $rule)
    {
        return $this->callProtected('getMessage', [$attribute, $rule]);
    }

    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param  array|string  $rules
     * @return array
     */
    public function parseRule($rules)
    {
        return $this->callProtected('parseRule', [$rules]);
    }

    /**
     * Get the displayable name of the value.
     *
     * @param string $attribute
     * @param mixed  $value
     *
     * @return string
     */
    public function getDisplayableValue($attribute, $value)
    {
        return $this->callProtected('getDisplayableValue', [$attribute, $value]);
    }

    /**
     * Get the displayable name of the attribute.
     *
     * @param string $attribute
     *
     * @return string
     */
    public function getAttribute($attribute)
    {
        return $this->callProtected('getAttribute', [$attribute]);
    }

    /**
     * Require a certain number of parameters to be present.
     *
     * @param  int    $count
     * @param  array  $parameters
     * @param  string  $rule
     *
     * @return mixed
     */
    public function requireParameterCount($count, $parameters, $rule)
    {
        return $this->callProtected('requireParameterCount', [$count, $parameters, $rule]);
    }

    /**
     * Calls inaccessible validator method.
     * @param $method
     * @param $args
     * @return mixed
     */
    private function callProtected($method, $args)
    {
        $validatorMethod = Closure::bind(function ($method, $args) {
            $callable = array($this, $method);

            return call_user_func_array($callable, $args);
        }, $this->validator, $this->validator);

        return $validatorMethod($method, $args);
    }

    /**
     * Delegate method calls to validator instance.
     *
     * @param $method
     * @param $params
     *
     * @return mixed
     */
    public function __call($method, $params)
    {
        $arrCaller = array($this->validator, $method);

        return call_user_func_array($arrCaller, $params);
    }
}
