<?php namespace Proengsoft\JsValidation;

use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use Proengsoft\JsValidation\Traits\JavascriptValidator;
use Illuminate\Validation\Validator as BaseValidator;

/**
 * Extends Laravel Validator to add Javascript Validations
 *
 * Class Validator
 * @package Proengsoft\JsValidation
 */
class Validator extends BaseValidator
{
    //use JavascriptValidator;

    //protected $disable_js_rule='NoJsValidation';

    const JSVALIDATION_DISABLE = 'NoJsValidation';
    const JSVALIDATION_REMOTE = 'jsValidationRemote';


    /**
     * Current implemented rules
     *
     * @var array
     */
    protected $implementedRules=['Accepted', 'ActiveUrl', 'After', 'Alpha', 'AlphaDash',
        'AlphaNum', 'Array', 'Before', 'Between', 'Boolean', 'Confirmed', 'Date',
        'DateFormat', 'Different', 'Digits', 'DigitsBetween', 'Email', 'Exists', 'Image',
        'In', 'Integer', 'Ip', 'Max', 'Mimes', 'Min', 'NotIn', 'Numeric',
        'Regex', 'Required', 'RequiredIf', 'RequiredWith', 'RequiredWithAll',
        'RequiredWithout', 'RequiredWithoutAll', 'Same', 'Size', 'String',
        'Sometimes','Timezone', 'Unique', 'Url'];

    /**
     * Rules validated via Ajax
     *
     * @var array
     */
    protected $remoteRules = array();


    /**
     * Determine if the data passes the validation rules.
     *
     * @return bool
     */
    public function passes()
    {

        if ($this->isRemoteValidation())
        {
            $message = $this->passesRemote($this->data['_jsvalidation']);
            throw new HttpResponseException(
                new JsonResponse($message, 200)
            );
        }

        return parent::passes();
    }

    /**
     * Add conditions to a given field based on a Closure.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @param  callable  $callback
     * @return void
     */
    public function sometimes($attribute, $rules, callable $callback)
    {
        $this->remoteRules[$attribute][]=$rules;
        parent::sometimes($attribute, $rules, $callback);
    }


    protected function isRemoteValidation()
    {
        return !empty($this->data['_jsvalidation']);
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
                    if (!$this->isRemoteRule($parsedRule[0], $attribute)) {
                        unset($this->rules[$attr][$i]);
                    }
                }
            } else {
                unset($this->rules[$attr]);
            }
        }
    }


    /**
     * Determine if the data passes the remote validation rules.
     *
     * @return bool
     */
    protected function passesRemote($attribute)
    {
        $this->setRemoteValidationData($attribute);

        if (parent::passes()) {
            return true;
        } else {
            return $this->messages()->get($attribute);
        }

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
        foreach ($this->rules as $attribute => $rules) {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) {
                continue;
            }

            // Convert each rules and messages
            list($attribute, $rules, $messages)=$this->jsConvertRules($attribute,$rules);

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
            if (empty($rule) || !$this->isImplemented($rule)) {
                //return array($attribute,false,false,false);
                continue;
            }

            // Gets the message
            $message = $this->getMessage($attribute, $rule);
            $message = $this->jsDoReplacements($message, $attribute, $rule, $parameters);

            // call the convert function if is defined
            $method="jsRule{$rule}";
            if (method_exists($this, "jsRule{$rule}")) {
                list($attribute, $rule, $parameters, $message) = $this->$method($attribute, $rule, $parameters,
                    $message);
            } elseif ($this->isRemoteRule($rawRule,$attribute)){
                list($attribute, $rule, $parameters, $message) = $this->jsRemoteRule($attribute, $rule, $parameters,
                    $message);
            } else {
                $rule="laravel{$rule}";
            }

            // Rule name must be unique
            $rule = $this->jsParseRuleName($rule, $jsRules);

            $jsRules[$rule]=$parameters;
            $jsMessages[$rule]=$message;
        }

        return [$attribute, $jsRules, $jsMessages];

    }


    /**
     * Returns parsed rule name for use in javascript
     *
     * @param $name
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
     * @param string $message
     * @param string $attribute
     * @param string $rule
     * @param string $parameters
     * @return mixed
     */
    protected function jsDoReplacements($message, $attribute, $rule, $parameters)
    {

        if ( isset($this->replacers[snake_case($rule)]) || !method_exists($this, $replacer = "jsReplace{$rule}"))
        {
            $message = $this->doReplacements($message, $attribute, $rule, $parameters);
        }
        elseif (method_exists($this, $replacer = "jsReplace{$rule}"))
        {
            $message = str_replace(':attribute', $this->getAttribute($attribute), $message);
            $message = $this->$replacer($message, $attribute, $rule, $parameters);
        }
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
     * @param $rule
     * @return bool
     */
    protected function isImplemented($rule)
    {
        return in_array($rule, $this->implementedRules);
    }


    /**
     * Check if rule must be validated remotely
     *
     * @param $rule
     * @param $attribute
     * @return bool
     */
    protected function isRemoteRule($rule, $attribute=null)
    {
        $parsedRule=$this->parseRule($rule);

        return is_array($rule) || in_array($parsedRule[0],['ActiveUrl','Exists', 'Unique']) ||
        ( !empty($this->remoteRules[$attribute]) && in_array($rule,$this->remoteRules[$attribute]));

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
     * Replace javascript error message place-holders in RequiredIf with actual values.
     *
     * @param $message
     * @param $attribute
     * @param $rule
     * @param $parameters
     * @return mixed
     */
    public function jsReplaceRequiredIf($message, $attribute, $rule, $parameters)
    {
        unset($attribute);
        unset($rule);

        $data = array();
        $data[$parameters[0]]=$parameters[1];

        $parameters[1] = $this->getDisplayableValue($parameters[0], array_get($data, $parameters[0]));
        $parameters[0] = $this->getAttribute($parameters[0]);

        return str_replace(array(':other', ':value'), $parameters, $message);
    }


    /**
     * Confirmed rule is applied to confirmed attribute
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     */
    protected function jsRuleConfirmed($attribute, $rule, array $parameters, $message)
    {
        $parameters[0]=$attribute;
        $rule="laravel{$rule}";
        $attribute="{$attribute}_confirmation";

        return [$attribute,$rule, $parameters,$message];
    }


    /**
     * Returns Javascript parameters for After rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     */
    protected function jsRuleAfter($attribute, $rule, array $parameters, $message)
    {
        $rule="laravel{$rule}";
        return [$attribute,$rule, [strtotime($parameters[0])],$message];
    }


    /**
     * Returns Javascript parameters for Before rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     */
    protected function jsRuleBefore($attribute, $rule, array $parameters, $message)
    {
        $rule="laravel{$rule}";
        return [$attribute,$rule, [strtotime($parameters[0])],$message];
    }


    /**
     * Returns Javascript parameters for ActiveUrl rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     *
    protected function jsRuleActiveUrl($attribute, $rule, array $parameters, $message)
    {
        return $this->jsRemoteRule($attribute, $rule, $parameters,$message);
    }


    /**
     * Returns Javascript parameters for Unique rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     *
    protected function jsRuleUnique($attribute, $rule, array $parameters, $message)
    {
        return $this->jsRemoteRule($attribute, $rule, $parameters,$message);
    }


    /**
     * Returns Javascript parameters for Unique rule
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     *
    protected function jsRuleExists($attribute, $rule, array $parameters, $message)
    {
        return $this->jsRemoteRule($attribute, $rule, $parameters,$message);
    }
    */

    /**
     * Returns Javascript parameters for remote validated rules
     *
     * @param $attribute
     * @param $rule
     * @param array $parameters
     * @param $message
     * @return array
     */
    protected function jsRemoteRule($attribute, $rule, array $parameters, $message)
    {
        $newRule = 'jsValidationRemote';
        $token=Crypt::encrypt(csrf_token());
        $params = [
            $attribute,
            $token
        ];

        return [$attribute,$newRule, $params, $message];
    }


}
