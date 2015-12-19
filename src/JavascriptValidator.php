<?php

namespace Proengsoft\JsValidation;

use Illuminate\Validation\Validator;
use Proengsoft\JsValidation\Support\DelegatedValidatorTrait;

class JavascriptValidator
{
    use DelegatedValidatorTrait, JavascriptRulesTrait;

    /**
     * Token used to secure remote validations.
     *
     * @var string
     */
    protected $token;

    /**
     * Enable or disable remote validations.
     *
     * @var bool
     */
    protected $remote = true;

    /**
     * Rule used to disable validations.
     *
     * @const string
     */
    const JSVALIDATION_DISABLE = 'NoJsValidation';

    /**
     * Create a new JsValidation instance.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @param array                            $options
     */
    public function __construct(Validator $validator, $options = [])
    {
        $this->setValidator($validator);

        $this->remote = empty($options['remote']) ? true : $options['remote'];
    }

    /**
     * Generate Javascript validations.
     *
     * @return array
     */
    protected function generateJavascriptValidations()
    {
        $jsValidations = array();

        foreach ($this->getRules() as $attribute => $rules) {
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
        if (!$this->jsValidationEnabled($attribute)) {
            return array();
        }

        $jsRules = [];
        foreach ($rules as $rawRule) {
            list($rule, $parameters) = $this->parseRule($rawRule);
            list($jsAttribute, $jsRule, $jsParams) = $this->getJsRule($attribute, $rule, $parameters);
            if ($jsRule) {
                $jsRules[$jsAttribute][$jsRule][] = array($rule, $jsParams,
                    $this->getJsMessage($attribute, $rule, $parameters),
                    $this->isImplicit($rule),
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
        if ($this->remote && $this->isRemoteRule($rule)) {
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
        $replacers = $this->getReplacers();
        if (isset($replacers[snake_case($rule)])) {
            $message = $this->doReplacements($message, $attribute, $rule, $parameters);
        } elseif (method_exists($this, $replacer = "jsReplace{$rule}")) {
            $message = $this->$replacer($attribute, $message, $parameters);
        } else {
            $message = $this->doReplacements($message, $attribute, $rule, $parameters);
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
        $prevFiles = $this->getFiles();
        if ($this->hasRule($attribute, array('Mimes', 'Image'))) {
            if (!array_key_exists($attribute, $prevFiles)) {
                $newFiles = $prevFiles;
                $newFiles[$attribute] = false;
                $this->setFiles($newFiles);
            }
        }

        $message = $this->getMessage($attribute, $rule);
        $this->setFiles($prevFiles);

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
        return !$this->hasRule($attribute, self::JSVALIDATION_DISABLE);
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
     *
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
     * Set the token  for securing remote validation.
     
     * @param string $token
     */
    public function setRemoteToken($token)
    {
        $this->token = $token;
    }

    /**
     * Gets the token  for securing remote validation.
     */
    public function getRemoteToken()
    {
        return $this->token;
    }

    /**
     * Enables the generation of remote rules.
     */
    public function enableRemote()
    {
        $this->remote = true;
    }

    /**
     * Disables the generation of remote rules.
     */
    public function disableRemote()
    {
        $this->remote = false;
    }

    /**
     * Check if the generation of remote rules is enabled.
     *
     * @return bool
     */
    public function remoteEnabled()
    {
        return $this->remote;
    }
}
