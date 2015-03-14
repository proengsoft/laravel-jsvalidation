<?php namespace Proengsoft\JQueryValidation\Traits;

trait JavascriptValidator
{

    /**
     * Rule thaht disables validation for and attribute
     *
     * @var string
     */
    protected $disable_js_rule='no_js_validation';

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
            foreach ($rules as $rule) {
                list($attribute,$rule, $parameters,$message) = $this->convertValidations($attribute,$rule);
                $jsRules[$attribute][$rule]=$parameters;
                $jsMessages[$attribute][$rule]=$message;
                /*
                $js_rule[$attribute]=$this->convertRule($attribute, $rule);
                $jsRules = array_merge($jsRules, $js_rule);

                $js_message[$attribute]=$this->convertMessage($attribute, $rule);
                $jsMessages=array_merge($jsMessages, $js_message);
                */
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


    protected function convertValidations($attribute,$rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        // Check if rule is implemented
        if ($rule == '' || !$this->isImplemented($rule)) {
            return array($attribute,[],[],[]);
        }

        // Gets the message
        $message = $this->getMessage($attribute, $rule);
        $message = $this->doReplacements($message, $attribute, $rule, $parameters);

        // call the convert function if is defined
        $method="jsRule{$rule}";

        if (method_exists($this,"jsRule{$rule}")) {
            list($attribute,$rule, $parameters,$message) = $this->$method($attribute,$rule,$parameters,$message);
        } else {
            $rule="laravel{$rule}";
        }

        return [$attribute,$rule,$parameters,$message];

    }


    /**
     * Convert a given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    protected function convertRule($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        // Check if rule is implemented
        if ($rule == '' || !$this->isImplemented($rule)) {
            return [];
        }

        return array("laravel{$rule}"=>$parameters);
    }


    /**
     * Convert the message from given rule using the converter.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @return array
     */
    protected function convertMessage($attribute, $rule)
    {
        list($rule, $parameters) = $this->parseRule($rule);

        // Check if rule is implemented
        if ($rule == '' || !$this->isImplemented($rule)) {
            return [];
        }

        $message = $this->getMessage($attribute, $rule);
        $message = $this->doReplacements($message, $attribute, $rule, $parameters);

        return array("laravel{$rule}"=>$message);
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
     * @param $attribute
     * @param $value
     * @param $parameters
     * @return bool
     */
    public function validateNoJsValidation($attribute, $value, $parameters)
    {
        return true;
    }


    /**
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

    protected function jsRuleConfirmed($attribute,$rule, array $parameters,$message)
    {
        $parameters[0]=$attribute;
        $rule="laravel{$rule}";
        $attribute="{$attribute}_confirmation";

        return [$attribute,$rule, $parameters,$message];
    }
}
