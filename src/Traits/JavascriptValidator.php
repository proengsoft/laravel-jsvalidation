<?php namespace Proengsoft\JsValidation\Traits;

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
        'RequiredWithout', 'RequiredWithoutAll', 'Same', 'Size', 'String', 'Timezone', 'Unique', 'Url'];


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
     * @param  array   $parameters
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
                    $jsRules[$attribute][$rule]=$parameters;
                    $jsMessages[$attribute][$rule]=$message;
                }
            }
        }

        return array($jsRules,$jsMessages);
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
     * @param $attribute
     * @param $rule
     * @return array
     */
    protected function convertValidations($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        // Check if rule is implemented
        if ($rule == '' || !$this->isImplemented($rule)) {
            return array($attribute,false,false,false);
        }

        // Gets the message
        $message = $this->getMessage($attribute, $rule);
        $message = $this->doReplacements($message, $attribute, $rule, $parameters);

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
     * Parse datetime format
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
     * Parse datetime format
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
}
