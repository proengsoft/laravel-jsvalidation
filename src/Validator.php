<?php

namespace Proengsoft\JsValidation;

use Proengsoft\JsValidation\Traits\RemoteValidation;
use Proengsoft\JsValidation\Traits\JavascriptRules;
use Illuminate\Contracts\Validation\Validator as ValidatorContract;

/**
 * Extends Laravel Validator to add Javascript Validations.
 *
 * Class Validator
 */
class Validator implements ValidatorContract
{
    use JavascriptRules,RemoteValidation;

    const JSVALIDATION_DISABLE = 'NoJsValidation';

    /**
     * The Validator resolved instance.
     *
     * @var DelegatedValidator
     */
    protected $validator;

    /**
     * Create a new JsValidation instance.
     *
     * @param \Proengsoft\JsValidation\DelegatedValidator $validator
     */
    public function __construct(DelegatedValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     * Returns DelegatedValidator instance.
     *
     * @return DelegatedValidator
     */
    public function getValidator()
    {
        return $this->validator;
    }

    /**
     * Generate Javascript validations.
     *
     * @return array
     */
    protected function generateJavascriptValidations()
    {
        $jsValidations = array();

        foreach ($this->validator->getRules() as $attribute => $rules) {
            $newRules = $this->jsConvertRules($attribute, $rules);
            $jsValidations = array_merge($jsValidations, $newRules);
        }

        return $jsValidations;
    }

    /**
     * Make Laravel Validations compatible with JQuery Validation Plugin.
     *
     * @param $attribute
     * @param $rules
     *
     * @return array
     */
    protected function jsConvertRules($attribute, $rules)
    {
        if (! $this->jsValidationEnabled($attribute)) {
            return array();
        }

        $jsRules = [];
        foreach ($rules as $rawRule) {
            list($rule, $parameters) = $this->validator->parseRule($rawRule);
            list($jsAttribute, $jsRule, $jsParams) = $this->getJsRule($attribute, $rule, $parameters);
            if ($jsRule) {
                $jsRules[$jsAttribute][$jsRule][] = array($rule, $jsParams,
                    $this->getJsMessage($attribute, $rule, $parameters),
                    $this->validator->isImplicit($rule),
                );
            }
        }

        return $jsRules;
    }

    /**
     * Return parsed Javascript Rule.
     *
     * @param string $attribute
     * @param string $rule
     * @param array  $parameters
     *
     * @return array
     */
    protected function getJsRule($attribute, $rule, $parameters)
    {
        if ($this->remoteValidationEnabled() && $this->isRemoteRule($rule)) {
            list($attribute, $parameters) = $this->jsRemoteRule($attribute);
            $jsRule = 'laravelValidationRemote';
        } else {
            list($jsRule, $attribute, $parameters) = $this->jsClientRule($attribute, $rule, $parameters);
        }

        $attribute = $this->getJsAttributeName($attribute);

        return [$attribute, $jsRule, $parameters];
    }

    /**
     *  Replace javascript error message place-holders with actual values.
     *
     * @param string $attribute
     * @param string $rule
     * @param array  $parameters
     *
     * @return mixed
     */
    protected function getJsMessage($attribute, $rule, $parameters)
    {
        $message = $this->getTypeMessage($attribute, $rule);
        $replacers = $this->validator->getReplacers();
        if (isset($replacers[snake_case($rule)])) {
            $message = $this->validator->doReplacements($message, $attribute, $rule, $parameters);
        } elseif (method_exists($this, $replacer = "jsReplace{$rule}")) {
            $message = $this->$replacer($attribute, $message, $parameters);
        } else {
            $message = $this->validator->doReplacements($message, $attribute, $rule, $parameters);
        }

        return $message;
    }

    /**
     * Get the message considering the data type.
     *
     * @param string $attribute
     * @param string $rule
     *
     * @return string
     */
    protected function getTypeMessage($attribute, $rule)
    {
        $prevFiles = $this->validator->getFiles();
        if ($this->validator->hasRule($attribute, array('Mimes', 'Image'))) {
            if (! array_key_exists($attribute, $prevFiles)) {
                $newFiles = $prevFiles;
                $newFiles[$attribute] = false;
                $this->validator->setFiles($newFiles);
            }
        }

        $message = $this->validator->getMessage($attribute, $rule);
        $this->validator->setFiles($prevFiles);

        return $message;
    }

    /**
     * Check if JS Validation is disabled for attribute.
     *
     * @param $attribute
     *
     * @return bool
     */
    public function jsValidationEnabled($attribute)
    {
        return ! $this->validator->hasRule($attribute, self::JSVALIDATION_DISABLE);
    }

    /**
     * Returns view data to render javascript.
     *
     * @return array
     */
    public function validationData()
    {
        $jsMessages = array();
        $jsValidations = $this->generateJavascriptValidations();

        return [
            'rules' => $jsValidations,
            'messages' => $jsMessages,
        ];
    }

    /**
     * Handles multidimensional attribute names.
     *
     * @param $attribute
     * @return string
     */
    protected function getJsAttributeName($attribute)
    {
        $attributeArray = explode('.', $attribute);
        if (count($attributeArray) > 1) {
            return $attributeArray[0].'['.implode('][', array_slice($attributeArray, 1)).']';
        }

        return $attribute;
    }

    /**
     * Get the messages for the instance.
     *
     * @return \Illuminate\Contracts\Support\MessageBag
     */
    public function getMessageBag()
    {
        return $this->validator->__call('getMessageBag', []);
    }

    /**
     * Determine if the data fails the validation rules.
     *
     * @return bool
     */
    public function fails()
    {
        return $this->validator->__call('fails', []);
    }

    /**
     * Get the failed validation rules.
     *
     * @return array
     */
    public function failed()
    {
        return $this->validator->__call('failed', []);
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
        $this->validator->__call('sometimes', [$attribute, $rules, $callback]);
    }

    /**
     * After an after validation callback.
     *
     * @param  callable|string $callback
     * @return $this
     */
    public function after($callback)
    {
        return $this->validator->__call('after', [$callback]);
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
