<?php

namespace Proengsoft\JsValidation\Traits;

use Closure;
use Illuminate\Validation\Validator as BaseValidator;

trait DelegatedValidator
{
    use AccessProtected;
    /**
     * The Validator resolved instance.
     *
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    /**
     *  Closure to invoke non accessible Validator methods
     *
     * @var Closure
     */
    protected $validatorMethod;

    private function callValidator($method, $args = [])
    {
        return $this->callProtected($this->validatorMethod, $method ,$args);
    }

    /**
     * Get current \Illuminate\Validation\Validator instance.
     *
     * @return \Illuminate\Validation\Validator
     */
    public function getValidator()
    {
        return $this->validator;
    }

    /**
     * Set Validation instance used to get rules and messages.
     *
     * @param \Illuminate\Validation\Validator $validator
     */
    public function setValidator(BaseValidator $validator)
    {
        $this->validator = $validator;
        $this->validatorMethod = $this->createProtectedCaller($validator);
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
        return $this->callValidator('isImplicit', [$rule]);
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
        return $this->callValidator('doReplacements', [$message, $attribute, $rule, $parameters]);
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
        return $this->callValidator('hasRule', [$attribute, $rules]);
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
        return $this->callValidator('getMessage', [$attribute, $rule]);
    }

    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param  array|string  $rules
     * @return array
     */
    public function parseRule($rules)
    {
        return $this->callValidator('parseRule', [$rules]);
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
        return $this->callValidator('getDisplayableValue', [$attribute, $value]);
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
        return $this->callValidator('getAttribute', [$attribute]);
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
        return $this->callValidator('requireParameterCount', [$count, $parameters, $rule]);
    }


    /**
     * Get the messages for the instance.
     *
     * @return \Illuminate\Contracts\Support\MessageBag
     */
    public function getMessageBag()
    {
        return $this->validator->getMessageBag();
    }

    /**
     * Determine if the data fails the validation rules.
     *
     * @return bool
     */
    public function fails()
    {
        return $this->validator->fails();
    }

    /**
     * Get the failed validation rules.
     *
     * @return array
     */
    public function failed()
    {
        return $this->validator->failed();
    }

    /**
     * Add conditions to a given field based on a Closure.
     *
     * @param  string $attribute
     * @param  string|array $rules
     * @param  callable $callback
     * @return void
     */
    public function sometimes($attribute, $rules, callable $callback)
    {
        $this->validator->sometimes($attribute, $rules, $callback);
    }

    /**
     * After an after validation callback.
     *
     * @param  callable|string $callback
     * @return $this
     */
    public function after($callback)
    {
        return $this->validator->after($callback);
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
