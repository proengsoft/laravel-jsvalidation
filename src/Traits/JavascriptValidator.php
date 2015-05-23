<?php namespace Proengsoft\JsValidation\Traits;

use Illuminate\Support\Facades\Crypt;

trait JavascriptValidator
{

    /**
     * Rule thaht disables validation for and attribute
     *
     * @var string
     */
    protected $disable_js_rule='NoJsValidation';

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


    protected $remoteRules = ['ActiveUrl','Exists'];

    /**
     * Get the validation rules.
     *
     * @return array
     */
    abstract public function getRules();


    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param  array|string  $rules
     * @return array
     */
    abstract protected function parseRule($rules);


    /**
     * Get the validation message for an attribute and rule.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return string
     */
    abstract protected function getMessage($attribute, $rule);


    /**
     * Replace all error message place-holders with actual values.
     *
     * @param  string  $message
     * @param  string  $attribute
     * @param  string  $rule
     * @param  string   $parameters
     * @return string
     */
    abstract protected function doReplacements($message, $attribute, $rule, $parameters);

    /**
     * Determine if the given attribute has a rule in the given set.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @return bool
     */
    abstract protected function hasRule($attribute, $rules);

    /**
     * Get the displayable name of the value.
     *
     * @param  string  $attribute
     * @param  mixed   $value
     * @return string
     */
    abstract public function getDisplayableValue($attribute, $value);

    /**
     * Get the displayable name of the attribute.
     *
     * @param  string  $attribute
     * @return string
     */
    abstract protected function getAttribute($attribute);

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
        foreach ($this->getRules() as $attribute => $rules) {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) {
                continue;
            }

            // Convert each rules and messages
            foreach ($rules as $rule) {
                list($attribute, $rule, $parameters, $message) = $this->convertValidations($attribute, $rule);
                if ($rule) {
                    $currentRules=empty($jsRules[$attribute])? [] :array_keys($jsRules[$attribute]);
                    $rule=$this->uniqueRuleName($rule, $currentRules);
                    $jsRules[$attribute][$rule]=$parameters;
                    $jsMessages[$attribute][$rule]=$message;
                }
            }
        }

        return array($jsRules,$jsMessages);
    }

    protected function uniqueRuleName($name, $rules)
    {
        if (!in_array($name,$rules)) return $name;

        $count=0;
        foreach ($rules as $rule) {
            if ($rule==$name || starts_with($rule,$name.'_')) $count++;
        }
        return $name.'_'.$count;
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
     * @return bool
     */
    protected function isRemoteRule($rule)
    {
        return in_array($rule,$this->remoteRules);
    }


    /**
     * Make Laravel Validations compatible with JQuery Validation Plugin
     *
     * @param $attribute
     * @param $source
     * @return array
     */
    protected function convertValidations($attribute, $source)
    {
        list($rule, $parameters) = $this->parseRule($source);

        // Check if rule is implemented
        if ($rule == '' || !$this->isImplemented($rule)) {
            return array($attribute,false,false,false);
        }

        // Gets the message
        $message = $this->getMessage($attribute, $rule);
        $message = $this->doJsReplacements($message, $attribute, $rule, $parameters);

        // call the convert function if is defined
        $method="jsRule{$rule}";

        if (method_exists($this, "jsRule{$rule}")) {
            list($attribute, $rule, $parameters, $message) = $this->$method($attribute, $rule, $parameters, $message);
        } else {
            $rule="laravel{$rule}";
        }

        return [$attribute,$rule,$parameters,$message];
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
    protected function doJsReplacements($message, $attribute, $rule, $parameters)
    {

        if ( (property_exists($this,'replacers') && isset($this->replacers[snake_case($rule)]))
            || !method_exists($this, $replacer = "jsReplace{$rule}"))
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
        return !$this->hasRule($attribute, $this->disable_js_rule);
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
     */
    protected function jsRuleActiveUrl($attribute, $rule, array $parameters, $message)
    {
        return $this->jsRemoteRule($attribute, $rule, $parameters,$message);
    }

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
