<?php namespace Proengsoft\JQueryValidation\Traits;


trait JavascriptValidator {

    protected $disable_js_rule='no_js_validation';

    protected $implementedRules=['Accepted', 'ActiveUrl', 'After', 'Alpha', 'AlphaDash',
        'AlphaNum', 'Array', 'Before', 'Between', 'Boolean', 'Confirmed', 'Date',
        'DateFormat', 'Different', 'Digits', 'DigitsBetween', 'Email', 'Exists', 'Image',
        'In', 'Integer', 'Ip', 'Max', 'Mimes', 'Min', 'NotIn', 'Numeric',
        'Regex', 'Required', 'RequiredIf', 'RequiredWith', 'RequiredWithAll',
        'RequiredWithout', 'RequiredWithoutAll', 'Same', 'Size', 'String', 'Timezone', 'Unique', 'Url'];

    protected $jsRules;
    protected $jsMessages;



    /**
     * Generate Javascript validations
     */
    protected function generateJavascriptValidations()
    {
        // Reinitializing arrays
        $jsRules=[];
        $jsMessages=[];

        // We'll spin through each rule, validating the attributes attached to that
        // rule. All enabled rules will be converted.
        foreach ($this->rules as $attribute => $rules)
        {
            // Check if JS Validation is disabled for this attribute
            if (!$this->jsValidationEnabled($attribute)) continue;

            // Convert each rules and messages
            foreach ($rules as $rule)
            {
                $js_rule[$attribute]=$this->convertRule($attribute, $rule);
                $jsRules = array_merge($jsRules,$js_rule);

                $js_message[$attribute]=$this->convertMessage($attribute, $rule);
                $jsMessages=array_merge($jsMessages, $js_message);
            }
        }

        return array($jsRules,$jsMessages);

    }
    
    protected function isImplemented($rule)
    {
        return in_array($rule,$this->implementedRules);
    }


    /**
     * Merge additional rules into a given attribute.
     *
     * @param  string  $attribute
     * @param  string|array  $rules
     * @return void
     */
    protected function mergeJsRules($attribute, $rules)
    {
        $current = isset($this->jsRules[$attribute]) ? $this->jsRules[$attribute] : [];

        if (!is_array($rules)) $rules=array($rules);

        $this->jsRules[$attribute] = array_merge($current, $rules);
    }

    /**
     * Merge additional messages into a given attribute.
     *
     * @param  string  $attribute
     * @param  string|array  $messages
     * @return void
     */
    protected function mergeJsMessages($attribute, $messages)
    {
        $current = isset($this->jsMessages[$attribute]) ? $this->jsMessages[$attribute] : [];

        if (!is_array($messages)) $messages=array($messages);

        $this->jsMessages[$attribute] = array_merge($current, $messages);
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
        if ($rule == '' || !$this->isImplemented($rule)) return [];

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
        if ($rule == '' || !$this->isImplemented($rule)) return [];

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
        return !$this->hasRule($attribute,$this->disable_js_rule);

    }


    public function validateNoJsValidation($attribute, $value, $parameters)
    {
        return true;
    }

    public function js()
    {
        list($jsRules,$jsMessages)=$this->generateJavascriptValidations();

        return [
            'rules' => $jsRules,
            'messages' => $jsMessages
        ];

    }

}