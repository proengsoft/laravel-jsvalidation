<?php namespace Proengsoft\JsValidation;

use Proengsoft\JsValidation\Traits\ValidateRemote;
use Proengsoft\JsValidation\Traits\JavascriptValidations;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Validator as BaseValidator;


/**
 * Extends Laravel Validator to add Javascript Validations
 *
 * Class Validator
 * @package Proengsoft\JsValidation
 */
class Validator extends BaseValidator
{
    use JavascriptValidations;

    const JSVALIDATION_DISABLE = 'NoJsValidation';
    const JSVALIDATION_REMOTE = 'jsValidationRemote';


    /**
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {

        if ($this->isRemoteValidationRequest())
        {
            $this->setRemoteValidationData($this->data['_jsvalidation']);
            if (parent::passes()) {
                $message=true;
            } else {
                $message=$this->messages()->get($this->data['_jsvalidation']);
            }

            throw new HttpResponseException(
                new JsonResponse($message, 200)
            );

        }

        return parent::passes();
    }


    /**
     *  Check if Request must be validated by JsValidation
     *
     * @return bool
     */
    protected function isRemoteValidationRequest()
    {
        return !empty($this->data['_jsvalidation']);
    }


    /**
     * Sets data for validate remote rules
     *
     * @param $attribute
     */
    protected function setRemoteValidationData($attribute)
    {
        foreach ($this->rules as $attr=>$rules) {
            if ($attr == $attribute) {
                foreach ($rules as $i=>$rule) {
                    $parsedRule=$this->parseRule($rule);
                    if (!$this->isRemoteRule($parsedRule[0])) {
                        unset($this->rules[$attr][$i]);
                    }
                }
            } else {
                unset($this->rules[$attr]);
            }
        }
    }


    /**
     * Disable Javascript Validations for some attribute
     *
     * @return bool
     */
    public function validateNoJsValidation()
    {
        return true;
    }


    /**
     * Generate Javascript validations
     *
     * @return array
     */
    protected function generateJavascriptValidations()
    {
        // Reinitializing arrays
        $jsRules=[];
        $jsMessages=[];

        // We'll spin through each rule, validating the attributes attached to that
        // rule. All enabled rules will be converted.
        foreach ($this->rules as $attribute => $rawRules) {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) {
                continue;
            }

            // Convert each rules and messages
            list($attribute, $rules, $messages)=$this->jsConvertRules($attribute,$rawRules);

            if (!empty($rules))
            {
                $jsRules[$attribute]=array();
                $jsMessages[$attribute]=array();
                $jsRules[$attribute]=array_merge($jsRules[$attribute], $rules);
                $jsMessages[$attribute]=array_merge($jsMessages[$attribute], $messages);
            }

        }

        return array($jsRules,$jsMessages);
    }


    /**
     * Make Laravel Validations compatible with JQuery Validation Plugin
     *
     * @param $attribute
     * @param $rules
     * @return array
     */
    protected function jsConvertRules($attribute, $rules)
    {
        $jsRules=[];
        $jsMessages=[];

        foreach ($rules as $rawRule) {

            list($rule, $parameters) = $this->parseRule($rawRule);

            // Check if rule is implemented
            if (!$this->isImplemented($rule)) {
                continue;
            }

            // Gets the message
            $message = $this->getJsMessage($attribute, $rule, $parameters);

            // call the convert function if is defined
            list($attribute, $rule, $jsParams)= $this->getJsRule($attribute, $rule, $parameters);

            // Rule name must be unique
            $rule = $this->jsParseRuleName($rule, $jsRules);

            $jsRules[$rule]=$jsParams;
            $jsMessages[$rule]=$message;
        }

        return [$attribute, $jsRules, $jsMessages];

    }



    /**
     * Return parsed Javascript Rule
     *
     * @param string $attribute
     * @param string $rule
     * @param array $parameters
     * @return array
     */
    protected function getJsRule($attribute, $rule, $parameters) {

        $method="jsRule{$rule}";

        if (method_exists($this, "jsRule{$rule}")) {
            list($attribute, $rule, $parameters) = $this->$method($attribute, $rule, $parameters);
        } elseif ($this->isRemoteRule($rule)){
            list($attribute, $rule, $parameters) = $this->jsRemoteRule($attribute);
        } else {
            $rule="laravel{$rule}";
        }

        return [$attribute, $rule, $parameters];
    }


    /**
     * Returns parsed rule name for use in javascript
     *
     * @param $name
     * @param $rules
     * @return string
     */
    protected function jsParseRuleName($name, $rules)
    {
        $count=0;
        $ruleName=$name;

        if ($name == self::JSVALIDATION_REMOTE) return $name;

        while (array_key_exists($ruleName, $rules)) {
            $count++;
            $ruleName=$name.'_'.$count;
        }

        return $ruleName;
    }


    /**
     *  Replace javascript error message place-holders with actual values.
     *
     * @param string $attribute
     * @param string $rule
     * @param array $parameters
     * @return mixed
     */
    protected function getJsMessage( $attribute, $rule, $parameters)
    {

        $message = $this->getTypeMessage($attribute, $rule);

        if ( isset($this->replacers[snake_case($rule)]) )
        {
            $message = $this->doReplacements($message, $attribute, $rule, $parameters);
        }
        elseif (method_exists($this, $replacer = "jsReplace{$rule}"))
        {
            $message = str_replace(':attribute', $this->getAttribute($attribute), $message);
            $message = $this->$replacer($message, $attribute, $rule, $parameters);
        } else {
            $message = $this->doReplacements($message, $attribute, $rule, $parameters);
        }

        return $message;
    }


    /**
     * Get the message considering the data type
     *
     * @param string $attribute
     * @param string $rule
     * @return string
     */
    private function getTypeMessage($attribute, $rule) {

        // @todo find more elegant solution to set the attribute file type
        $prevFiles=$this->files;
        if ($this->hasRule($attribute, array('Mimes','Image')))
        {
            if (!array_key_exists($attribute, $this->files)) {
                $this->files[$attribute]=false;
            }
        }

        $message = $this->getMessage($attribute, $rule);
        $this->files=$prevFiles;

        return $message;
    }


    /**
     * Check if JS Validation is disabled for attribute
     *
     * @param $attribute
     * @return bool
     */
    public function jsValidationEnabled($attribute)
    {
        return !$this->hasRule($attribute, self::JSVALIDATION_DISABLE);
    }


    /**
     * Check if rule is implemented
     *
     * @param string $rule
     * @return bool
     */
    protected function isImplemented($rule)
    {
        if (empty($rule)) return false;

        $method="validate{$rule}";
        if (!method_exists($this,$method)) {
            return $this->ruleIsExtension($rule);
        }
        return true;

    }



    /**
     * Check if rule is extension
     *
     * @param $rule
     * @return bool
     */
    protected function ruleIsExtension($rule)
    {
        $rule=snake_case($rule);
        return in_array($rule, array_keys($this->extensions));
    }



    /**
     * Check if rule must be validated remotely
     *
     * @param string $rule
     * @return bool
     */
    protected function isRemoteRule($rule)
    {
        if (!in_array($rule,['ActiveUrl','Exists', 'Unique']))
        {
            return $this->ruleIsExtension($rule);
        }

        return true;
    }


    /**
     * Returns view data to render javascript
     *
     * @return array
     */
    public function js()
    {
        list($jsRules, $jsMessages)=$this->generateJavascriptValidations();
        return [
            'rules' => $jsRules,
            'messages' => $jsMessages
        ];
    }



    /**
     * Returns Javascript parameters for remote validated rules
     *
     * @param $attribute
     * @return array
     */
    protected function jsRemoteRule($attribute)
    {
        $newRule = 'jsValidationRemote';

        $token= Session::token();
        $token=Crypt::encrypt($token);
        $params = [
            $attribute,
            $token
        ];

        return [$attribute,$newRule, $params];
    }


}
